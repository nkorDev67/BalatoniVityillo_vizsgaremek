"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_UTAK, OLDAL_UTAK, apiVegpont } from '@/lib/utvonalak';

type RouteGuardResult = {
  allowed: boolean;
  checking: boolean;
  role: string | null;
};

export const useRouteGuard = (allowedRoles: string[]): RouteGuardResult => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const allowedRoleKey = allowedRoles.join('|');

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace(OLDAL_UTAK.kezdolap);
        setAllowed(false);
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(apiVegpont(API_UTAK.azonositas.profilom), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          router.replace(OLDAL_UTAK.kezdolap);
          setAllowed(false);
          setChecking(false);
          return;
        }

        const userData = await response.json();
        const currentRole = userData.role ?? null;

        localStorage.setItem('role', currentRole ?? '');
        setRole(currentRole);

        if (!currentRole || !allowedRoles.includes(currentRole)) {
          router.replace(OLDAL_UTAK.kezdolap);
          setAllowed(false);
          setChecking(false);
          return;
        }

        setAllowed(true);
      } catch {
        router.replace(OLDAL_UTAK.kezdolap);
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };

    verifyAccess();
  }, [allowedRoleKey, router]);

  return { allowed, checking, role };
};