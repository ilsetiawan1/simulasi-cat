"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";

export const PROFILE_UPDATED_EVENT = "simcat:profile-updated";

export function notifyProfileUpdated(profile: ProfileRow) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProfileRow>(PROFILE_UPDATED_EVENT, { detail: profile }));
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) return;
      const body = (await response.json()) as { data?: ProfileRow };
      if (body.data) {
        setProfile(body.data);
      }
    } catch {
      // Abaikan jika gagal memuat profil ringan di header
    }
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        const currentUser = data.user ?? null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) {
          loadProfile();
        }
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        loadProfile();
      } else {
        setProfile(null);
      }
    });

    function onProfileUpdated(event: Event) {
      const custom = event as CustomEvent<ProfileRow>;
      if (custom.detail) {
        setProfile(custom.detail);
      }
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return { user, profile, loading, signOut };
}
