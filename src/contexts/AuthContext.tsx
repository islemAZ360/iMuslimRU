'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export interface HealthProfile {
    name: string;
    photoURL: string;
    height: number;
    weight: number;
    dateOfBirth: string;
    chronicDiseases: string[];
    allergies: string[];
}

interface AuthContextType {
    user: User | null;
    healthProfile: HealthProfile | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    updateHealthProfile: (data: Partial<HealthProfile>) => Promise<void>;
    refreshHealthProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchHealthProfile = useCallback(async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setHealthProfile(docSnap.data() as HealthProfile);
            } else {
                setHealthProfile(null);
            }
        } catch (error) {
            console.error('Error fetching health profile:', error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchHealthProfile(user.uid);
            } else {
                setHealthProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [fetchHealthProfile]);

    const loginWithGoogle = useCallback(async () => {
        const result = await signInWithPopup(auth, googleProvider);
        // Create initial profile doc if first login
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            await setDoc(docRef, {
                name: result.user.displayName || '',
                photoURL: result.user.photoURL || '',
                height: 0,
                weight: 0,
                dateOfBirth: '',
                chronicDiseases: [],
                allergies: [],
            });
        }
    }, []);

    const loginWithEmail = useCallback(async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    }, []);

    const registerWithEmail = useCallback(async (email: string, password: string, name: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await setDoc(doc(db, 'users', result.user.uid), {
            name,
            photoURL: '',
            height: 0,
            weight: 0,
            dateOfBirth: '',
            chronicDiseases: [],
            allergies: [],
        });
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        setHealthProfile(null);
    }, []);

    const deleteAccount = useCallback(async () => {
        if (auth.currentUser) {
            // Delete Firestore data first, then auth account
            const uid = auth.currentUser.uid;
            try {
                await deleteDoc(doc(db, 'users', uid));
            } catch (e) {
                console.warn('Failed to delete user data from Firestore:', e);
            }
            await deleteUser(auth.currentUser);
            setHealthProfile(null);
        }
    }, []);

    const updateHealthProfile = useCallback(
        async (data: Partial<HealthProfile>) => {
            if (!user) return;
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, data, { merge: true });
            setHealthProfile((prev) => (prev ? { ...prev, ...data } : (data as HealthProfile)));
        },
        [user]
    );

    const refreshHealthProfile = useCallback(async () => {
        if (user) {
            await fetchHealthProfile(user.uid);
        }
    }, [user, fetchHealthProfile]);

    return (
        <AuthContext.Provider
            value={{
                user,
                healthProfile,
                loading,
                loginWithGoogle,
                loginWithEmail,
                registerWithEmail,
                logout,
                deleteAccount,
                updateHealthProfile,
                refreshHealthProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
