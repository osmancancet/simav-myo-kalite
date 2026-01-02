import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#1a365d]">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Content */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white mb-6 shadow-2xl">
                            <span className="text-4xl font-bold text-[#1a365d]">DPÜ</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Simav MYO</h1>
                        <p className="text-lg text-blue-200">Kalite Yönetim Sistemi</p>
                    </div>

                    {/* Login Card */}
                    <Card className="bg-white shadow-2xl border-0">
                        <CardContent className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-[#1a365d] mb-2">Sisteme Giriş</h2>
                                <p className="text-slate-500 text-sm">
                                    Kurumsal e-posta adresiniz ile giriş yapın
                                </p>
                            </div>

                            <form
                                action={async () => {
                                    "use server"
                                    await signIn("google", { redirectTo: "/" })
                                }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-[#c53030] hover:bg-[#9b2c2c] text-white font-semibold text-base gap-3 rounded-xl shadow-lg transition-all hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google ile Giriş Yap
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Sadece @dpu.edu.tr uzantılı hesaplar
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <p className="text-center text-blue-200/50 text-xs mt-8">
                        Kütahya Dumlupınar Üniversitesi © 2025
                    </p>
                </div>
            </div>
        </div>
    )
}
