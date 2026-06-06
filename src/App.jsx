import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Landing        from './pages/Landing';
import StudentForm    from './pages/StudentForm';
import Motivation     from './pages/Motivation';
import Test           from './pages/Test';
import Results        from './pages/Results';
import AdminLogin     from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function StudentFlow() {
  const [step, setStep]         = useState('landing');
  const [student, setStudent]   = useState(null);
  const [testResult, setResult] = useState(null);

  return (
    <>
      {step === 'landing'    && <Landing     onStart={() => setStep('form')} />}
      {step === 'form'       && <StudentForm onSubmit={d  => { setStudent(d); setStep('motivation'); }} />}
      {step === 'motivation' && <Motivation  student={student} onStart={() => setStep('test')} />}
      {step === 'test'       && <Test        student={student} onComplete={r => { setResult(r); setStep('results'); }} />}
      {step === 'results'    && <Results     student={student} result={testResult}
                                  onRestart={() => { setStudent(null); setResult(null); setStep('landing'); }} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<StudentFlow />} />
        <Route path="/admin"           element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
