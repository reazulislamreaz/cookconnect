'use client';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

const VerifyCodeForm = () => {
  const inputRefs = useRef([]);
  const [code, setCode] = useState(['', '', '', '', '']);
const router = useRouter();
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredCode = code.join('');
    console.log('Entered verification code:', enteredCode);
    router.push('/setNewPass')
  };

  const handleResend = () => {
    console.log('Resend code clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md text-center"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Check your email</h2>
        <p className="text-gray-500 mb-6 text-sm">
          We sent a reset link to <span className="font-medium text-gray-700">contact@dscode_.com</span><br />
          enter 5 digit code that mentioned in the email
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold transition duration-200"
        >
          Verify Code
        </button>

        <p className="text-sm text-gray-600 mt-4">
          You have not received the email?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="text-green-600 font-medium hover:underline"
          >
            Resend
          </button>
        </p>
      </form>
    </div>
  );
};

export default VerifyCodeForm;
