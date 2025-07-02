
import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TransactionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  amount?: string;
  isHighValue?: boolean;
  contractAddress?: string;
}

const TransactionConfirmDialog: React.FC<TransactionConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  amount,
  isHighValue = false,
  contractAddress
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {isHighValue ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <Shield className="w-5 h-5 text-blue-500" />
            )}
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          {amount && (
            <div className="bg-rose-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-rose-900">Amount:</span>
                <span className="text-sm font-bold text-rose-900">{amount} ETH</span>
              </div>
            </div>
          )}

          {contractAddress && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-1">Contract Address:</div>
                <div className="font-mono break-all">{contractAddress}</div>
              </div>
            </div>
          )}

          {isHighValue && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <div className="font-medium mb-1">High Value Transaction</div>
                  <div>Please double-check all details before confirming this transaction.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={`flex-1 ${isHighValue ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-rose-600 hover:bg-rose-700'} text-white`}
          >
            Confirm Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TransactionConfirmDialog;
