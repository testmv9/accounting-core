import React, { useState, useRef, useEffect } from 'react';
import { useNIAgent } from './agent-context';
import { Sparkles, X, Send, MessageSquare, Briefcase, Zap, Search, Paperclip, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeDocumentAction, getIngestionContextAction, recordDocumentAction } from '../../lib/ni/vision';
import { askSeniorPartnerAction } from '../../lib/ni/advisor';

/**
 * NISidebar: The Resident Accountant UI
 * 
 * Phase 4: Strategic Advisor (Ground Truth Analysis).
 */
export default function NISidebar() {
    const { activePersona, setActivePersona, messages, addMessage, isOpen, setIsOpen } = useNIAgent();
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [draftData, setDraftData] = useState<any>(null);
    const [context, setContext] = useState<any>(null);
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = inputValue.trim();
        if (!query || isProcessing) return;

        addMessage({
            role: 'user',
            content: query,
            timestamp: new Date().toLocaleTimeString()
        });

        setInputValue('');
        setIsProcessing(true);

        if (activePersona === 'SENIOR_PARTNER') {
            const result = await askSeniorPartnerAction(query, messages);
            if (result.success) {
                addMessage({
                    role: 'assistant',
                    persona: 'SENIOR_PARTNER',
                    content: result.content || '',
                    timestamp: new Date().toLocaleTimeString()
                });
            } else {
                addMessage({
                    role: 'assistant',
                    persona: 'SENIOR_PARTNER',
                    content: `⚠️ Error: ${result.error}`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        } else {
            // Placeholder for other persona chat logic
            setTimeout(() => {
                addMessage({
                    role: 'assistant',
                    persona: activePersona,
                    content: `I've noted that. I'm currently specializing in document ingestion and ledger health. Switch to Senior Partner for strategic analysis!`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }, 800);
        }

        setIsProcessing(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        addMessage({
            role: 'user',
            content: `Uploaded file: ${file.name}`,
            timestamp: new Date().toLocaleTimeString()
        });

        try {
            // Convert to base64 for the server action
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];

                // Switch to Intake Clerk for analysis as per PERSONA_MANIFEST
                setActivePersona('INTAKE_CLERK');

                const [res, ctx] = await Promise.all([
                    analyzeDocumentAction(base64, file.type),
                    getIngestionContextAction()
                ]);

                if (res.success && res.data) {
                    setDraftData({ ...res.data, fileType: file.type });
                    setContext(ctx);

                    // Pre-select entity if name matches exactly
                    const matchedEntity = (res.data.type === 'INVOICE' ? ctx.customers : ctx.suppliers)
                        .find((ev: any) => ev.name.toLowerCase() === res.data.entityName.toLowerCase());

                    if (matchedEntity) setSelectedEntityId(matchedEntity.id);

                    addMessage({
                        role: 'assistant',
                        persona: 'INTAKE_CLERK',
                        content: `I've analyzed the ${res.data.type}. Math is 100% verified. Please select the account and confirm drafting below.`,
                        timestamp: new Date().toLocaleTimeString()
                    });
                } else {
                    addMessage({
                        role: 'assistant',
                        persona: 'INTAKE_CLERK',
                        content: `⚠️ I encountered an issue: ${res.error || "Could not parse document"}.`,
                        timestamp: new Date().toLocaleTimeString()
                    });
                }
                setIsProcessing(false);
            };
        } catch (err) {
            console.error("Upload failed", err);
            setIsProcessing(false);
        }
    };

    const handlePostToLedger = async () => {
        if (!draftData || !selectedEntityId || !selectedAccountId) return;

        setIsProcessing(true);
        const result = await recordDocumentAction({
            type: draftData.type,
            entityId: selectedEntityId,
            date: draftData.date,
            dueDate: draftData.date, // Defaulting for now
            accountId: selectedAccountId,
            lines: draftData.lineItems.map((l: any) => ({
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unitPrice
            }))
        });

        if (result.success) {
            setActivePersona('CHIEF_OF_STAFF');
            addMessage({
                role: 'assistant',
                persona: 'CHIEF_OF_STAFF',
                content: `✅ Successfully drafted as a ${draftData.type.toLowerCase()}! The ledger has been updated.`,
                timestamp: new Date().toLocaleTimeString()
            });
            setDraftData(null);
        } else {
            addMessage({
                role: 'assistant',
                persona: 'CHIEF_OF_STAFF',
                content: `❌ FAILED: ${result.error}`,
                timestamp: new Date().toLocaleTimeString()
            });
        }
        setIsProcessing(false);
    };

    return (
        <>
            <button
                className="ni-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Navera Intelligence"
            >
                {isOpen ? <X size={28} /> : <Zap size={28} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="ni-sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="ni-header">
                            <div className="ni-persona-badge">
                                <div className="ni-avatar">
                                    <Sparkles size={16} fill="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--foreground)' }}>
                                        {activePersona === 'SENIOR_PARTNER' && 'Senior Partner'}
                                        {activePersona === 'INTAKE_CLERK' && 'Intake Clerk'}
                                        {activePersona === 'CHIEF_OF_STAFF' && 'Chief of Staff'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        NI Digital Staff
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Persona Switcher */}
                        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                            <button
                                onClick={() => setActivePersona('SENIOR_PARTNER')}
                                className={`btn-secondary-premium ${activePersona === 'SENIOR_PARTNER' ? 'active' : ''}`}
                                style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', borderColor: activePersona === 'SENIOR_PARTNER' ? 'var(--ni-primary)' : 'transparent' }}
                                title="Senior Partner (Advisor)"
                            >
                                <Briefcase size={14} />
                            </button>
                            <button
                                onClick={() => setActivePersona('INTAKE_CLERK')}
                                className={`btn-secondary-premium ${activePersona === 'INTAKE_CLERK' ? 'active' : ''}`}
                                style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', borderColor: activePersona === 'INTAKE_CLERK' ? 'var(--ni-primary)' : 'transparent' }}
                                title="Intake Clerk (Specialist)"
                            >
                                <Zap size={14} />
                            </button>
                            <button
                                onClick={() => setActivePersona('CHIEF_OF_STAFF')}
                                className={`btn-secondary-premium ${activePersona === 'CHIEF_OF_STAFF' ? 'active' : ''}`}
                                style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', borderColor: activePersona === 'CHIEF_OF_STAFF' ? 'var(--ni-primary)' : 'transparent' }}
                                title="Chief of Staff (Executor)"
                            >
                                <Search size={14} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="ni-chat-container">
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
                                    <MessageSquare size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                                    <p style={{ fontSize: '0.9rem' }}>How can the NI team help you today?</p>
                                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Try uploading an invoice or receipt file.</p>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`ni-message ${msg.role === 'user' ? 'ni-message-user' : 'ni-message-assistant'}`}>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                    <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.6, textAlign: 'right' }}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            ))}
                            {/* Phase 3: Drafting Widget */}
                            {draftData && context && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="ni-message ni-message-assistant"
                                    style={{ border: '1px solid var(--ni-primary)', background: 'rgba(var(--ni-primary-rgb), 0.05)' }}
                                >
                                    <div style={{ fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--ni-primary)' }}>
                                        <CheckCircle2 size={14} /> DRAFT PROPOSAL
                                    </div>

                                    <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--muted)' }}>Detected Entity:</span>
                                            <span style={{ fontWeight: '600' }}>{draftData.entityName}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--muted)' }}>Total Amount:</span>
                                            <span style={{ fontWeight: '600' }}>${(draftData.totalCents / 100).toFixed(2)}</span>
                                        </div>

                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Match to Entity:</label>
                                            <select
                                                className="input-premium"
                                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem', background: 'transparent' }}
                                                value={selectedEntityId}
                                                onChange={(e) => setSelectedEntityId(e.target.value)}
                                            >
                                                <option value="">-- Select {draftData.type === 'INVOICE' ? 'Customer' : 'Supplier'} --</option>
                                                {(draftData.type === 'INVOICE' ? context.customers : context.suppliers).map((ev: any) => (
                                                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Categorize to Account:</label>
                                            <select
                                                className="input-premium"
                                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem', background: 'transparent' }}
                                                value={selectedAccountId}
                                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                            >
                                                <option value="">-- Select Account --</option>
                                                {(draftData.type === 'INVOICE' ? context.revenueAccounts : context.expenseAccounts).map((a: any) => (
                                                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={handlePostToLedger}
                                            disabled={!selectedEntityId || !selectedAccountId || isProcessing}
                                            className="btn-primary-premium"
                                            style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem' }}
                                        >
                                            Post to Ledger
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {isProcessing && (
                                <div className="ni-message ni-message-assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>{activePersona.replace('_', ' ')} is working...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="ni-input-area">
                            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept=".pdf,image/*,.csv"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'absolute',
                                        left: '0.5rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--muted)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    className="input-premium"
                                    placeholder={`Message ${activePersona.replace('_', ' ').toLowerCase()}...`}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ paddingLeft: '3rem', paddingRight: '3.5rem' }}
                                />
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    style={{
                                        position: 'absolute',
                                        right: '0.5rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: isProcessing ? 'var(--muted)' : 'var(--ni-primary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
