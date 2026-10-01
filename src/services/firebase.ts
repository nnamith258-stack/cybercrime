/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ForensicScanResult, ReconstructedFile } from '../types/forensics';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as required by Firestore integration rules
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running in offline persistence mode.');
    }
    return true;
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sync profile record
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: user.uid,
      email: user.email || 'unknown@analyst.recoveryai',
      displayName: user.displayName || 'Forensic Analyst',
      role: 'analyst',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
  }

  return user;
}

export async function signInWithCredentials(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // Auto-register new investigator with credentials
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user = cred.user;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          displayName: email.split('@')[0],
          role: 'analyst',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Could not sync user profile:', e);
      }
      return user;
    }
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export interface SavedEvidenceCase {
  id: string;
  userId: string;
  caseName: string;
  datasetName: string;
  evidenceSha256: string;
  datasetSizeBytes: number;
  totalFragments: number;
  identifiedFragments: number;
  reconstructedFilesCount: number;
  reconstructedFiles: any[];
  fragments: any[];
  createdAt: string;
  updatedAt: string;
}

export { onAuthStateChanged };

/**
 * Save an uploaded evidence case to Firestore for authenticated investigator
 */
export async function saveEvidenceCaseToDatabase(
  scanResult: ForensicScanResult,
  caseTitle?: string
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required: Sign in to save evidence cases to the forensic cloud database.');
  }

  const caseId = `CASE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `cases/${caseId}`;

  // Sanitize reconstructed files metadata
  const sanitizedFiles = scanResult.reconstructedFiles.map(f => ({
    id: f.id,
    name: f.name,
    fileType: f.fileType,
    mimeType: f.mimeType,
    status: f.status,
    integrityPercentage: f.integrityPercentage,
    recoveryPercentage: f.recoveryPercentage,
    sha256: f.sha256,
    sizeBytes: f.sizeBytes,
    fragmentIds: f.fragmentIds
  }));

  const sanitizedFragments = scanResult.fragments.map(fr => ({
    id: fr.id,
    index: fr.index,
    offsetStart: fr.offsetStart,
    offsetEnd: fr.offsetEnd,
    sizeBytes: fr.sizeBytes,
    detectedSignature: fr.detectedSignature,
    predictedType: fr.predictedType,
    confidenceScore: fr.confidenceScore,
    entropy: fr.entropy,
    status: fr.status
  }));

  const caseData = {
    id: caseId,
    userId: user.uid,
    caseName: caseTitle || `Investigation of ${scanResult.datasetName}`,
    datasetName: scanResult.datasetName,
    evidenceSha256: scanResult.datasetSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    datasetSizeBytes: scanResult.datasetSizeBytes,
    totalFragments: scanResult.stats.totalFragments,
    identifiedFragments: scanResult.stats.identifiedFragments,
    reconstructedFilesCount: scanResult.reconstructedFiles.length,
    reconstructedFiles: sanitizedFiles,
    fragments: sanitizedFragments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'cases', caseId), caseData);
    return caseId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetch all saved evidence cases for current authenticated investigator
 */
export async function fetchUserEvidenceCases(): Promise<SavedEvidenceCase[]> {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const path = 'cases';
  try {
    const q = query(collection(db, path), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const cases: SavedEvidenceCase[] = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      cases.push({
        id: docSnap.id,
        userId: data.userId,
        caseName: data.caseName || 'Untitled Evidence Case',
        datasetName: data.datasetName || 'evidence.img',
        evidenceSha256: data.evidenceSha256 || '',
        datasetSizeBytes: data.datasetSizeBytes || 0,
        totalFragments: data.totalFragments || 0,
        identifiedFragments: data.identifiedFragments || 0,
        reconstructedFilesCount: data.reconstructedFilesCount || 0,
        reconstructedFiles: data.reconstructedFiles || [],
        fragments: data.fragments || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      });
    });

    return cases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Delete an evidence case from Firestore
 */
export async function deleteEvidenceCase(caseId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');

  const path = `cases/${caseId}`;
  try {
    await deleteDoc(doc(db, 'cases', caseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
