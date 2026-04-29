import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = ({ onLogin }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const user = params.get('user');
    const error = params.get('error');

    if (error || !user) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(user));
      if (parsed.accessToken) localStorage.setItem('accessToken', parsed.accessToken);
      if (parsed.refreshToken) localStorage.setItem('refreshToken', parsed.refreshToken);
      localStorage.setItem('user', JSON.stringify(parsed));
      onLogin(parsed);
      navigate('/dashboard', { replace: true });
    } catch {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
