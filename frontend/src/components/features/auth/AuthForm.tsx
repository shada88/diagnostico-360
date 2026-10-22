"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../shared/ui/Button";
import EmailVerification from "./EmailVerification";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

/* ── Estilos inline reutilizables (dark + gold) ───────────────────────────── */
const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
};

/* Los inputs usan la clase .input-dark definida en globals.css
   que incluye override de autofill del navegador */

const labelStyle: React.CSSProperties = { color: 'var(--text-soft)' };
const errorBgStyle: React.CSSProperties = {
    background: 'rgba(139,26,26,0.15)',
    border: '1px solid rgba(139,26,26,0.35)',
    color: '#f87171',
};

export default function AuthForm({ defaultMode = "login" }: { defaultMode?: "login" | "register" }) {
    const router = useRouter();
    const [step, setStep] = useState<"auth" | "verify" | "forgot-email" | "forgot-verify" | "forgot-reset">("auth");
    const [isLogin, setIsLogin] = useState(defaultMode === "login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            authApi.getProfile().then((profile) => {
                if (!profile.isProfileComplete) {
                    router.replace("/auth/profile");
                } else {
                    router.replace("/personal/diagnostico");
                }
            }).catch(() => {
                localStorage.removeItem("token");
            });
        }
    }, [router]);

    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const response = await authApi.login(form.email, form.password);
                if (response && response.access_token) {
                    localStorage.setItem("token", response.access_token);
                    if (response.user && !response.user.isProfileComplete) {
                        router.push("/auth/profile");
                    } else {
                        router.push("/personal/diagnostico");
                    }
                }
            } else {
                await authApi.register({ email: form.email, password: form.password });
                setStep("verify");
            }
        } catch (err: any) {
            if (isLogin && err?.response?.status === 401) {
                setError("Correo electrónico o contraseña incorrectos.");
            } else {
                setError(err?.response?.data?.message || "Ocurrió un error. Por favor intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setLoading(true);
        try {
            await authApi.forgotPassword(form.email);
            setStep("forgot-verify");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Error al solicitar restablecimiento.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setLoading(true);
        try {
            await authApi.resetPassword(form.email, resetCode, newPassword);
            const response = await authApi.login(form.email, newPassword);
            if (response && response.access_token) {
                localStorage.setItem("token", response.access_token);
                if (response.user && !response.user.isProfileComplete) {
                    router.push("/auth/profile");
                } else {
                    router.push("/personal/diagnostico");
                }
            } else {
                setStep("auth");
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Código inválido o error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (code: string) => {
        await authApi.verifyEmail(form.email, code);
    };

    const handleResendCode = async () => {
        setResending(true);
        setError("");
        try {
            await authApi.resendCode(form.email);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Error al reenviar el código.");
        } finally {
            setResending(false);
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
        window.location.href = `${apiUrl}/auth/google`;
    };

    const handleVerified = async () => {
        setLoading(true);
        try {
            const response = await authApi.login(form.email, form.password);
            if (response && response.access_token) {
                localStorage.setItem("token", response.access_token);
                if (response.user && !response.user.isProfileComplete) {
                    router.push("/auth/profile");
                } else {
                    router.push("/personal/diagnostico");
                }
            }
        } catch {
            setError("Error al iniciar sesión tras verificar. Por favor, intenta de nuevo.");
            setStep("auth");
            setIsLogin(true);
        } finally {
            setLoading(false);
        }
    };

    /* ── Verify step ──────────────────────────────────────────────────────── */
    if (step === "verify") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-8 rounded-2xl shadow-xl"
                style={cardStyle}
            >
                <EmailVerification
                    email={form.email}
                    onVerifyCode={handleVerifyCode}
                    onResendCode={handleResendCode}
                    onVerified={handleVerified}
                />
            </motion.div>
        );
    }

    /* ── Forgot password: enter email ─────────────────────────────────────── */
    if (step === "forgot-email") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl shadow-xl" style={cardStyle}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-pearl)' }}>Recuperar contraseña</h2>
                <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Ingresa tu correo para recibir un código de recuperación.</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={labelStyle}>Correo Electrónico</label>
                        <input name="email" type="email" required className="input-dark"
                            value={form.email} onChange={handleChange} />
                    </div>
                    {error && <div className="text-sm p-3 rounded-lg" style={errorBgStyle}>{error}</div>}
                    <Button type="submit" className="w-full h-12" isLoading={loading}>Enviar Código</Button>
                    <button type="button" onClick={() => { setStep("auth"); setError(""); }}
                        className="w-full text-sm mt-4 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-pearl)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                        Cancelar
                    </button>
                </form>
            </motion.div>
        );
    }

    /* ── Forgot password: verify + reset ──────────────────────────────────── */
    if (step === "forgot-verify" || step === "forgot-reset") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl shadow-xl" style={cardStyle}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-pearl)' }}>Nueva Contraseña</h2>
                <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Ingresa el código enviado a <strong style={{ color: 'var(--text-soft)' }}>{form.email}</strong> y tu nueva contraseña.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={labelStyle}>Código de 6 dígitos</label>
                        <input type="text" required
                            className="input-dark text-center tracking-widest font-mono text-lg"
                            placeholder="000000" value={resetCode}
                            onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').substring(0, 6))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={labelStyle}>Nueva Contraseña</label>
                        <input type="password" required className="input-dark"
                            placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={labelStyle}>Confirmar Contraseña</label>
                        <input type="password" required className="input-dark"
                            placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    {error && <div className="text-sm p-3 rounded-lg" style={errorBgStyle}>{error}</div>}
                    <Button type="submit" className="w-full h-12" isLoading={loading}>Cambiar Contraseña</Button>
                    <div className="flex flex-col gap-3 mt-4">
                        <button type="button" onClick={handleResendCode} disabled={resending}
                            className="w-full text-sm font-semibold disabled:opacity-50 transition-colors"
                            style={{ color: 'var(--gold)' }}>
                            {resending ? "Reenviando código..." : "¿No recibiste el código? Reenviar"}
                        </button>
                        <button type="button" onClick={() => { setStep("auth"); setError(""); }}
                            className="w-full text-sm transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-pearl)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    }

    /* ── Main auth form ───────────────────────────────────────────────────── */
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 rounded-2xl shadow-xl overflow-hidden"
            style={cardStyle}
        >
            {/* Tabs */}
            <div className="flex relative mb-8"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => { setIsLogin(true); setError(""); }}
                    className={cn("flex-1 pb-3 text-sm font-semibold transition-colors relative z-10")}
                    style={{ color: isLogin ? 'var(--gold)' : 'var(--text-muted)' }}
                >
                    Iniciar Sesión
                    {isLogin && (
                        <motion.div layoutId="authTab"
                            className="absolute bottom-0 left-0 w-full h-[2px]"
                            style={{ background: 'var(--gold)' }}
                            transition={{ duration: 0.3, ease: "easeInOut" }} />
                    )}
                </button>
                <button
                    onClick={() => { setIsLogin(false); setError(""); }}
                    className={cn("flex-1 pb-3 text-sm font-semibold transition-colors relative z-10")}
                    style={{ color: !isLogin ? 'var(--gold)' : 'var(--text-muted)' }}
                >
                    Registrarse
                    {!isLogin && (
                        <motion.div layoutId="authTab"
                            className="absolute bottom-0 left-0 w-full h-[2px]"
                            style={{ background: 'var(--gold)' }}
                            transition={{ duration: 0.3, ease: "easeInOut" }} />
                    )}
                </button>
            </div>

            <motion.form layout onSubmit={handleSubmit} className="space-y-4" transition={{ duration: 0.4, ease: "easeOut" }}>
                <div>
                    <label className="block text-sm font-medium mb-1" style={labelStyle}>Correo Electrónico</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="input-dark"
                        placeholder="tu@correo.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium" style={labelStyle}>Contraseña</label>
                        {isLogin && (
                            <button type="button" onClick={() => setStep("forgot-email")}
                                className="text-xs font-medium transition-colors"
                                style={{ color: 'var(--gold-dim)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold-dim)')}>
                                ¿Olvidaste tu contraseña?
                            </button>
                        )}
                    </div>
                    <input
                        name="password"
                        type="password"
                        required
                        className="input-dark"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-sm p-3 rounded-lg" style={errorBgStyle}>
                        {error}
                    </motion.div>
                )}

                <motion.div layout className="space-y-3 mt-6">
                    <Button type="submit" className="w-full h-12 text-lg" isLoading={loading}>
                        {isLogin ? "Entrar a mi cuenta" : "Crear mi cuenta"}
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>o</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full h-11 flex items-center justify-center gap-3 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-soft)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                            e.currentTarget.style.color = 'var(--text-pearl)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-soft)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                        Continuar con Google
                    </button>
                </motion.div>

                <AnimatePresence>
                    {!isLogin ? (
                        <motion.div key="register-helper"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden">
                            <div className="pt-4 text-center">
                                <p className="text-sm font-medium tracking-tight" style={{ color: 'var(--text-muted)' }}>
                                    Crea una cuenta nueva para iniciar tu diagnóstico.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="login-helper"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden">
                            <div className="pt-4 text-center">
                                <p className="text-sm font-medium tracking-tight" style={{ color: 'var(--text-muted)' }}>
                                    ¿No tienes cuenta?{' '}
                                    <button type="button" onClick={() => { setIsLogin(false); setError(""); }}
                                        className="font-semibold transition-colors"
                                        style={{ color: 'var(--gold)' }}>
                                        Regístrate aquí
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
        </motion.div>
    );
}
