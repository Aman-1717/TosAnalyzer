import { SignIn, SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export function SignInWrapper() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center min-h-[80vh] px-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to continue to TOS Analyzer</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <SignIn 
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-none",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function SignUpWrapper() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center min-h-[80vh] px-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create an Account</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign up to get started with TOS Analyzer</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <SignUp 
            routing="path" 
            path="/sign-up" 
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-none",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

