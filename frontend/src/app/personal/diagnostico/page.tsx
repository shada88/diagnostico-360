import { Suspense } from "react";
import SurveyWizard from "@/components/features/survey/SurveyWizard";

export default function SurveyPage() {
    return (
        <main className="min-h-screen" style={{ background: 'var(--bg-space)' }}>
            <Suspense>
                <SurveyWizard />
            </Suspense>
        </main>
    );
}
