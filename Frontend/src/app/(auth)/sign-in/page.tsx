import { SignIn } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Navbar'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-card border border-card/50 rounded-xl shadow-xl',
                headerTitle: 'text-foreground font-bold text-2xl',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'border border-card/50 bg-card/30 hover:bg-card/50 text-foreground',
                formFieldInput: 'bg-background border border-card focus:border-primary rounded-lg',
                formFieldLabel: 'text-foreground font-medium',
                footerActionLink: 'text-primary hover:underline',
                footerActionText: 'text-muted-foreground',
              },
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
