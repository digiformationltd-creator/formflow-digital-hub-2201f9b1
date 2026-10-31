import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resetRouteSeo } from '@/lib/seo';

export default function RouteSeoBoundary() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-route-ready');
    resetRouteSeo(pathname);
  }, [pathname]);
  useEffect(() => {
    // This component sits after Routes *inside* Suspense, so its effect only
    // commits after the actual lazy page (not a stale page/loading fallback).
    document.documentElement.dataset.routeReady = pathname;
  }, [pathname]);
  return null;
}
