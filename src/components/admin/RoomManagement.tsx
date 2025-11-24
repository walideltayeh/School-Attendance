import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Edit, Trash2, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Room {
  id: string;
  name: string;
  building?: string;
  floor?: number;
  capacity?: number;
}

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    building: "",
    floor: "",
    capacity: ""
  });

  useEffect(() => {
    loadRooms();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          console.log('Rooms changed, reloading...');
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
      return;
    }

    setRooms(data || []);
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return false;
    }

    if (formData.name.length > 50) {
      toast({
        title: "Validation Error",
        description: "Room name must be less than 50 characters",
        variant: "destructive",
      });
      return false;
    }

    if (formData.building && formData.building.length > 50) {
      toast({
        title: "Validation Error",
        description: "Building name must be less than 50 characters",
        variant: "destructive",
      });
      return false;
    }

    if (formData.floor && (isNaN(Number(formData.floor)) || Number(formData.floor) < -10 || Number(formData.floor) > 100)) {
      toast({
        title: "Validation Error",
        description: "Floor must be a number between -10 and 100",
        variant: "destructive",
      });
      return false;
    }

    if (formData.capacity && (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1 || Number(formData.capacity) > 1000)) {
      toast({
        title: "Validation Error",
        description: "Capacity must be a number between 1 and 1000",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    const roomData: any = {
      name: formData.name.trim(),
      building: formData.building.trim() || null,
      floor: formData.floor ? Number(formData.floor) : null,
      capacity: formData.capacity ? Number(formData.capacity) : null
    };

    const { error } = await supabase
      .from('rooms')
      .insert([roomData]);

    if (error) {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A room with this name already exists" 
          : "Failed to add room",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Room added successfully",
    });

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedRoom || !validateForm()) return;

    const roomData: any = {
      name: formData.name.trim(),
      building: formData.building.trim() || null,
      floor: formData.floor ? Number(formData.floor) : null,
      capacity: formData.capacity ? Number(formData.capacity) : null
    };

    const { error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', selectedRoom.id);

    if (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A room with this name already exists" 
          : "Failed to update room",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Room updated successfully",
    });

    setIsEditDialogOpen(false);
    setSelectedRoom(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', selectedRoom.id);

    if (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Room deleted successfully",
    });

    setIsDeleteDialogOpen(false);
    setSelectedRoom(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      building: "",
      floor: "",
      capacity: ""
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      building: room.building || "",
      floor: room.floor?.toString() || "",
      capacity: room.capacity?.toString() || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Room Management
              </CardTitle>
              <CardDescription>Add and manage school rooms</CardDescription>
            </div>
            <Button onClick={openAddDialog} variant="blue">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No rooms added yet
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{room.building || "-"}</TableCell>
                    <TableCell>{room.floor !== null && room.floor !== undefined ? room.floor : "-"}</TableCell>
                    <TableCell>{room.capacity || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(room)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Room Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 101, Lab A, Auditorium"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-building">Building</Label>
              <Input
                id="add-building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., Main Building, Science Block"
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-floor">Floor</Label>
                <Input
                  id="add-floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 1, 2"
                  min="-10"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-capacity">Capacity</Label>
                <Input
                  id="add-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 30, 50"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleAdd}>
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Room Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 101, Lab A, Auditorium"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-building">Building</Label>
              <Input
                id="edit-building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., Main Building, Science Block"
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <Input
                  id="edit-floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 1, 2"
                  min="-10"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 30, 50"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRoom?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
