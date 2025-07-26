import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, Users, Plus, History, MoreHorizontal, Trash2, Save, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertGymClassSchema, type GymClass, type InsertGymClass, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAuthError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return true;
    }
    return false;
  };

  // Fetch gym classes
  const { data: gymClasses = [], isLoading } = useQuery<GymClass[]>({
    queryKey: ["/api/gym-classes"],
  });

  // Create gym class form
  const addForm = useForm<InsertGymClass>({
    resolver: zodResolver(insertGymClassSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      attendance: 0,
      notes: "",
    },
  });

  // Edit gym class form
  const editForm = useForm<InsertGymClass>({
    resolver: zodResolver(insertGymClassSchema),
    defaultValues: {
      date: "",
      attendance: 0,
      notes: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: InsertGymClass) => apiRequest("POST", "/api/gym-classes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gym-classes"] });
      addForm.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        attendance: 0,
        notes: "",
      });
      toast({
        title: "Success",
        description: "Class record saved successfully!",
      });
    },
    onError: (error) => {
      if (handleAuthError(error)) return;
      toast({
        title: "Error",
        description: "Failed to save class record. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertGymClass> }) =>
      apiRequest("PATCH", `/api/gym-classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gym-classes"] });
      setIsEditModalOpen(false);
      setEditingClass(null);
      toast({
        title: "Success",
        description: "Class updated successfully!",
      });
    },
    onError: (error) => {
      if (handleAuthError(error)) return;
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/gym-classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gym-classes"] });
      setIsEditModalOpen(false);
      setEditingClass(null);
      toast({
        title: "Success",
        description: "Class deleted successfully!",
      });
    },
    onError: (error) => {
      if (handleAuthError(error)) return;
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertGymClass) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertGymClass) => {
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data });
    }
  };

  const openEditModal = (gymClass: GymClass) => {
    setEditingClass(gymClass);
    editForm.reset({
      date: gymClass.date,
      attendance: gymClass.attendance,
      notes: gymClass.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClass(null);
  };

  const handleDelete = () => {
    if (editingClass) {
      deleteMutation.mutate(editingClass.id);
    }
  };

  // Calculate stats
  const thisWeekClasses = gymClasses.filter(cls => {
    const classDate = new Date(cls.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return classDate >= weekStart;
  });

  const avgAttendance = gymClasses.length > 0 
    ? Math.round(gymClasses.reduce((sum, cls) => sum + cls.attendance, 0) / gymClasses.length)
    : 0;

  // Monthly stats calculations
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  const monthlyClasses = gymClasses.filter(cls => {
    const classDate = new Date(cls.date);
    return classDate >= monthStart && classDate <= monthEnd;
  });

  const singlePersonClasses = monthlyClasses.filter(cls => cls.attendance === 1).length;
  const multiplePersonClasses = monthlyClasses.filter(cls => cls.attendance > 1).length;

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };



  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMM d");
    }
  };

  return (
    <div className="min-h-screen bg-ios-light-gray">
      {/* iOS Status Bar */}
      <div className="bg-white pt-safe-top">
        <div className="flex justify-between items-center px-6 py-2 text-sm font-semibold">
          <span>9:41</span>
          <span>Gym Tracker</span>
          <div className="flex space-x-1 text-xs">
            <span>📶</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-ios-separator px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Gym Class Tracker</h1>
            <p className="text-ios-gray text-sm mt-1">Record attendance for your classes</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            className="text-ios-blue hover:bg-ios-light-gray p-2 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        {user && (
          <div className="text-center mt-3 pt-3 border-t border-ios-separator">
            <p className="text-sm text-ios-gray">
              Welcome back, {(user as User).email || (user as User).firstName || 'User'}!
            </p>
          </div>
        )}
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Add Class Form */}
        <Card className="bg-white rounded-xl shadow-sm border-ios-separator">
          <CardHeader className="px-6 py-4 border-b border-ios-separator">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Plus className="text-ios-blue mr-3 h-5 w-5" />
              Add New Class
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={addForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">Class Date</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full px-4 py-3 bg-ios-light-gray rounded-xl border-0 text-base focus:ring-2 focus:ring-ios-blue focus:bg-white transition-all duration-200"
                          />
                        </FormControl>
                        <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ios-gray pointer-events-none h-4 w-4" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="attendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">Number of Attendees</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="999"
                            placeholder="Enter count"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-ios-light-gray rounded-xl border-0 text-base focus:ring-2 focus:ring-ios-blue focus:bg-white transition-all duration-200"
                          />
                        </FormControl>
                        <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ios-gray pointer-events-none h-4 w-4" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes about the class..."
                          rows={3}
                          {...field}
                          className="w-full px-4 py-3 bg-ios-light-gray rounded-xl border-0 text-base focus:ring-2 focus:ring-ios-blue focus:bg-white transition-all duration-200 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-ios-blue hover:bg-blue-600 text-white py-4 rounded-xl font-semibold text-base transition-all duration-200 active:scale-95"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Saving..." : "Save Class Record"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="bg-white rounded-xl shadow-sm border-ios-separator">
          <CardHeader className="px-6 py-4 border-b border-ios-separator">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeMonth('prev')}
                className="p-2 hover:bg-ios-light-gray rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 text-ios-blue" />
              </Button>
              <CardTitle className="text-lg font-semibold">
                {format(selectedMonth, "MMMM yyyy")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeMonth('next')}
                className="p-2 hover:bg-ios-light-gray rounded-lg"
              >
                <ChevronRight className="h-4 w-4 text-ios-blue" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-ios-blue">{monthlyClasses.length}</div>
                <div className="text-sm text-ios-gray mt-1">Total Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ios-purple">{singlePersonClasses}</div>
                <div className="text-sm text-ios-gray mt-1">1 Person</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ios-green">{multiplePersonClasses}</div>
                <div className="text-sm text-ios-gray mt-1">2+ People</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl border-ios-separator">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ios-blue">{thisWeekClasses.length}</div>
              <div className="text-sm text-ios-gray mt-1">This Week</div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl border-ios-separator">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ios-green">{avgAttendance}</div>
              <div className="text-sm text-ios-gray mt-1">Avg Attendance</div>
            </CardContent>
          </Card>
        </div>

        {/* Class History */}
        <Card className="bg-white rounded-xl shadow-sm border-ios-separator">
          <CardHeader className="px-6 py-4 border-b border-ios-separator flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold flex items-center">
              <History className="text-ios-purple mr-3 h-5 w-5" />
              Class History
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <CardContent className="p-6">
              <div className="text-center text-ios-gray">Loading...</div>
            </CardContent>
          ) : gymClasses.length === 0 ? (
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-lg font-semibold mb-2">No Classes Yet</h3>
              <p className="text-ios-gray text-sm">Start tracking your gym classes by adding your first session above.</p>
            </CardContent>
          ) : (
            <div className="divide-y divide-ios-separator">
              {gymClasses.map((gymClass) => (
                <div key={gymClass.id} className="px-6 py-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{formatDisplayDate(gymClass.date)}</div>
                        <div className="text-sm text-ios-gray mt-1">2:30 PM</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-ios-blue">{gymClass.attendance}</div>
                        <div className="text-xs text-ios-gray">attendees</div>
                      </div>
                    </div>
                    {gymClass.notes && (
                      <div className="text-sm text-ios-gray mt-2">{gymClass.notes}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 p-2 text-ios-gray hover:text-ios-blue"
                    onClick={() => openEditModal(gymClass)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Bottom Safe Area */}
      <div className="h-safe-bottom bg-ios-light-gray"></div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-full max-w-lg rounded-t-2xl bottom-0 top-auto transform-none">
          <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-ios-separator pb-4">
            <Button
              variant="ghost"
              className="text-ios-blue font-medium"
              onClick={closeEditModal}
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            <DialogTitle className="font-semibold">Edit Class</DialogTitle>
            <Button
              variant="ghost"
              className="text-ios-blue font-medium"
              onClick={editForm.handleSubmit(onEditSubmit)}
              disabled={updateMutation.isPending}
            >
              <Save className="mr-1 h-4 w-4" />
              Save
            </Button>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <Form {...editForm}>
              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="w-full px-4 py-3 bg-ios-light-gray rounded-xl border-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="attendance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="999"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-ios-light-gray rounded-xl border-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                        className="w-full px-4 py-3 bg-ios-light-gray rounded-xl border-0 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

            <Button
              variant="destructive"
              className="w-full bg-ios-red hover:bg-red-600 text-white py-3 rounded-xl font-medium"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMutation.isPending ? "Deleting..." : "Delete Class"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
