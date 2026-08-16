import React, { useState } from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, ShieldCheck, MapPin, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const faqs = [
    {
      q: 'How does Geofence Attendance Verification work?',
      a: 'When your instructor broadcasts a live lecture session, open your Student Portal and click "Check In to Classroom". Your device checks your GPS coordinates against the room location. You must be within the room perimeter (approx. 50 meters) to be marked as verified.',
    },
    {
      q: 'What if I am outside the geofence perimeter?',
      a: 'If you check in from outside the perimeter, your attendance will be recorded as "Flagged Deviation" and sent to your Course Instructor and Head of Department for review.',
    },
    {
      q: 'How do I apply for Duty Leave or Medical Exemption?',
      a: 'Navigate to "Academic Leave" in your dashboard sidebar, select the dates and reason, and submit. Once approved by faculty, your missed sessions are marked as Excused without penalty.',
    },
    {
      q: 'How does AI synthesize study plans and question papers?',
      a: 'NEGU-EduPortal utilizes Gemini 2.5 models on the server. The AI analyzes your individual attendance, weak topics in past assignments, and exam syllabi to produce custom revision schedules.',
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setSupportMessage('');
      onClose();
    }, 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="NEGU Academic Help & Support Desk"
      subtitle="Frequently asked questions and direct support ticket submission"
    >
      <div className="space-y-5 text-xs">
        {/* FAQs */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Frequently Answered Questions
          </h4>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group p-3 rounded-lg border border-slate-200 bg-slate-50/50 open:bg-white open:ring-1 open:ring-blue-100 transition-all"
              >
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between list-none">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Submit Ticket */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
            Submit Support Query to IT / Registrar
          </h4>
          {ticketSent ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ticket #IT-2026-894 submitted successfully! Response within 2 hours.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-2">
              <textarea
                rows={2}
                placeholder="Describe your technical or academic enquiry..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600 focus:outline-hidden"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit" leftIcon={<Send className="w-3 h-3" />}>
                  Dispatch Support Ticket
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};
