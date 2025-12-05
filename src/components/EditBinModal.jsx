import { useState } from 'react';
import EditBinForm from './EditBinForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EditBinModal = ({ bin, open, onOpenChange, onBinUpdated }) => {
  const handleBinUpdated = (updatedBin) => {
    if (onOpenChange) onOpenChange(false);
    if (onBinUpdated) onBinUpdated(updatedBin);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[9999]">
        <DialogHeader>
          <DialogTitle>Edit Dustbin</DialogTitle>
        </DialogHeader>
        <EditBinForm bin={bin} onBinUpdated={handleBinUpdated} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default EditBinModal;
