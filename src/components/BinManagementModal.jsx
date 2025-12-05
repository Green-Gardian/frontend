import { useState } from 'react';
import AddBinForm from './AddBinForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const BinManagementModal = ({ onBinAdded }) => {
  const [open, setOpen] = useState(false);

  const handleBinAdded = (bin) => {
    setOpen(false);
    if (onBinAdded) onBinAdded(bin);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 relative z-50">
          <Plus className="h-4 w-4" />
          Add Bin
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[9999]">
        <DialogHeader>
          <DialogTitle>Add New Dustbin</DialogTitle>
        </DialogHeader>
        <AddBinForm onBinAdded={handleBinAdded} />
      </DialogContent>
    </Dialog>
  );
};

export default BinManagementModal;
