/**
 * =========================================================================
 * ElecPal (电气伴侣) · 用户认证与会话服务
 * 支持 Firebase Google OAuth 免密登录与游客离线沙盒双模无缝切换
 * =========================================================================
 */
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export interface CurrentUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

export type AuthStateListener = (user: CurrentUser) => void;

export class AuthService {
  private static currentUser: CurrentUser = {
    uid: 'guest-local-user',
    email: 'guest@elecpal.local',
    displayName: '游客工程师 (Guest)',
    photoURL: null,
    isGuest: true
  };

  private static listeners: AuthStateListener[] = [];

  static {
    if (auth) {
      onAuthStateChanged(auth, (fbUser: User | null) => {
        if (fbUser) {
          AuthService.currentUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '电气工程师',
            photoURL: fbUser.photoURL,
            isGuest: false
          };
        } else {
          AuthService.currentUser = {
            uid: 'guest-local-user',
            email: 'guest@elecpal.local',
            displayName: '游客工程师 (Guest)',
            photoURL: null,
            isGuest: true
          };
        }
        AuthService.notifyListeners();
      });
    }
  }

  public static getCurrentUser(): CurrentUser {
    return this.currentUser;
  }

  public static async signInWithGoogle(): Promise<CurrentUser> {
    if (!auth) {
      console.warn('【Auth】Firebase Auth 未连接，保持游客沙盒模式。');
      return this.currentUser;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      this.currentUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '电气工程师',
        photoURL: fbUser.photoURL,
        isGuest: false
      };
      this.notifyListeners();
      return this.currentUser;
    } catch (error: any) {
      console.error('【Auth】Google 登录失败或用户取消:', error);
      throw error;
    }
  }

  public static async signOutUser(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
    this.currentUser = {
      uid: 'guest-local-user',
      email: 'guest@elecpal.local',
      displayName: '游客工程师 (Guest)',
      photoURL: null,
      isGuest: true
    };
    this.notifyListeners();
  }

  public static subscribe(listener: AuthStateListener): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(fn => fn(this.currentUser));
  }
}
