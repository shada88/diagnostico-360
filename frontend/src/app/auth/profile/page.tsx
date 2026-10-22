import ProfileForm from "@/components/features/auth/ProfileForm";

export default function ProfilePage() {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
            style={{ background: 'var(--bg-space)' }}>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <ProfileForm />
            </div>
        </div>
    );
}
