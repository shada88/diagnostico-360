import { useState, useEffect } from "react";
import { Button } from "../../shared/ui/Button";

interface EmailVerificationProps {
    email: string;
    onVerified: () => void;
    onResendCode: () => Promise<void>;
    onVerifyCode: (code: string) => Promise<void>;
}

export default function EmailVerification({ email, onVerified, onResendCode, onVerifyCode }: EmailVerificationProps) {
    const [code, setCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError("");

        if (code.length !== 6) {
            setError("El código debe tener 6 dígitos.");
            return;
        }

        setLoading(true);
        try {
            await onVerifyCode(code);
            onVerified();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Código inválido. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading) return;
        setError("");
        setResendSuccess(false);
        setLoading(true);
        try {
            await onResendCode();
            setTimeLeft(60);
            setResendSuccess(true);
        } catch {
            setError("No se pudo reenviar el código. Intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full text-center space-y-6">
            <div className="space-y-2">
                {/* Icono email — gold sobre fondo oscuro */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--gold-12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-pearl">Verifica tu correo</h2>
                <p className="text-sm max-w-xs mx-auto text-muted">
                    Hemos enviado un código de 6 dígitos a <br />
                    <span className="font-semibold text-soft">{email}</span>
                </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <input
                        type="text"
                        maxLength={6}
                        className="input-dark text-center tracking-[0.5em] text-2xl !py-3 !rounded-xl !text-[var(--gold-bright)]"
                        placeholder="••••••"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        required
                    />
                </div>

                {error && (
                    <div className="text-sm p-3 rounded-lg"
                        style={{ background: 'rgba(139,26,26,0.15)', border: '1px solid rgba(139,26,26,0.35)', color: '#f87171' }}>
                        {error}
                    </div>
                )}
                {resendSuccess && (
                    <div className="text-sm p-3 rounded-lg"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                        Nuevo código enviado.
                    </div>
                )}

                <Button type="submit" className="w-full h-12" isLoading={loading} disabled={code.length !== 6}>
                    Verificar Código
                </Button>
            </form>

            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                {timeLeft > 0 ? (
                    <p className="text-sm text-muted">
                        Podrás reenviar el código en <span className="font-medium text-soft">{timeLeft}s</span>
                    </p>
                ) : (
                    <button onClick={handleResend} disabled={loading}
                        className="text-sm font-semibold transition-colors"
                        style={{ color: 'var(--gold)' }}>
                        Reenviar código
                    </button>
                )}
            </div>
        </div>
    );
}
