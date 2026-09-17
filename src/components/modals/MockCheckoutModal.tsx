'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Copy,
  Check,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'test' | 'test_series';
  itemId: string;
  itemTitle: string;
  creatorName?: string;
  priceInr: number;
  onSuccess?: (order: any) => void;
}

export function MockCheckoutModal({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  creatorName,
  priceInr,
  onSuccess,
}: MockCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Financial breakdown
  const basePrice = Number(priceInr) || 0;
  const simulatedGst = Math.round(basePrice * 0.18 * 100) / 100;
  const totalPrice = Math.round((basePrice + simulatedGst) * 100) / 100;

  const handleAuthorizePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          amount_inr: totalPrice,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment authorization failed');
      }

      setCompletedOrder(data.order);
      if (onSuccess) {
        onSuccess(data.order);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sandbox checkout');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyReceipt = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.receipt_number || completedOrder.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setCompletedOrder(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={completedOrder ? 'Order Confirmation' : 'Nalanda Assessment Checkout'}
      description={
        completedOrder
          ? 'Your access entitlement has been registered in the platform ledger.'
          : 'Complete simulated purchase to unlock full assessment materials and derivations.'
      }
      size="md"
    >
      {completedOrder ? (
        // PURCHASE CONFIRMATION PLACEHOLDER
        <div className="space-y-5 py-2">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-base text-emerald-950">
              Access Granted & Verified
            </h3>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Simulated order successfully authorized in sandbox ledger. You now hold full access to all questions, solutions, and analytics.
            </p>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>Item Entitlement:</span>
              <span className="font-bold text-stone-900 text-right truncate max-w-[200px]">
                {itemTitle}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Order Number:</span>
              <span className="font-mono font-bold text-stone-800">{completedOrder.id}</span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Receipt Number:</span>
              <span className="font-mono font-bold text-stone-800">{completedOrder.receipt_number}</span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Amount Recorded:</span>
              <span className="font-mono font-bold text-emerald-700">₹{completedOrder.amount_inr}</span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Gateway Mode:</span>
              <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Sandbox Mock Ledger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleCopyReceipt}
              className="flex-1 text-xs"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied Receipt' : 'Copy Receipt ID'}
            </Button>
            <Button
              variant="primary"
              onClick={handleResetAndClose}
              className="flex-1 text-xs"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Continue to Assessment
            </Button>
          </div>
        </div>
      ) : (
        // CHECKOUT FLOW & SANDBOX ORDER SUMMARY
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Sandbox Notice Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Sandbox Payment Mode</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Nalanda is operating in preview sandbox mode. No real credit card or bank deductions will occur. Clicking &quot;Authorize Simulated Payment&quot; records a simulated order in the platform ledger.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-stone-400 block">
                  {itemType === 'test_series' ? 'Test Series Package' : 'Individual Examination'}
                </span>
                <h4 className="font-sans font-bold text-stone-900 text-sm mt-0.5">
                  {itemTitle}
                </h4>
                {creatorName && (
                  <p className="text-[11px] text-stone-500">Authored by {creatorName}</p>
                )}
              </div>
              <Badge variant="saffron" size="sm">
                Paid Access
              </Badge>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Base Tuition Fee:</span>
                <span className="font-mono">₹{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Simulated GST (18%):</span>
                <span className="font-mono">₹{simulatedGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Platform Academic Guarantee:</span>
                <span>Included</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Payable:</span>
                <span className="font-mono text-base text-amber-900">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
              Simulated Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAuthorizePayment}
              disabled={processing}
              icon={<Lock className="w-3.5 h-3.5" />}
            >
              {processing ? 'Authorizing Sandbox Order...' : `Authorize ₹${totalPrice.toFixed(2)}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
