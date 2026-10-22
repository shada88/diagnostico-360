import Image from "next/image";
import AuthForm from "@/components/features/auth/AuthForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
            style={{ background: 'var(--bg-space)' }}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/logo.svg"
                        alt="Acme Consultores"
                        width={200}
                        height={158}
                        priority
                    />
                </div>
                <h2 className="text-center text-2xl font-bold" style={{ color: 'var(--text-pearl)' }}>
                    Bienvenido de vuelta
                </h2>
                <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Ingresa a tu cuenta para continuar
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <AuthForm defaultMode="login" />
            </div>
        </div>
    );
}
