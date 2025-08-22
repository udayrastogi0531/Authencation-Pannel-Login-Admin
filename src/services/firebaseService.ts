import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types/auth';

export interface FirebaseUser extends Omit<User, 'id' | 'createdAt' | 'lastLogin'> {
  id?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
  password: string; // Include password for Firebase storage
}

export interface ActivityLog {
  id?: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Timestamp;
  userEmail: string;
  userRole: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  lastUpdated: Timestamp;
}

class FirebaseService {
  // User Management
  async createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<FirebaseUser>): Promise<void> {
    try {
      console.log('🔥 Firebase service: Starting user update for ID:', userId);
      console.log('📝 Firebase service: Update data:', userData);
      
      const userRef = doc(db, 'users', userId);
      console.log('📄 Firebase service: User reference created');
      
      await updateDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp(),
      });
      
      console.log('✅ Firebase service: User update completed successfully');
    } catch (error) {
      console.error('❌ Firebase service: Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<FirebaseUser | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<FirebaseUser[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FirebaseUser[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Activity Logging
  async logActivity(activityData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        ...activityData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, 'activityLogs'), 
        orderBy('timestamp', 'desc'),
        // Note: limit() would require additional Firebase imports
        // For now, we'll fetch all and limit in memory
      );
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as ActivityLog[];
      
      // Apply limit in memory
      return logs.slice(0, limit);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  }

  async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, 'activityLogs'), 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as ActivityLog[];
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      throw error;
    }
  }

  // System Stats
  async updateSystemStats(): Promise<void> {
    try {
      const users = await this.getAllUsers();
      const totalUsers = users.length;
      const adminUsers = users.filter(user => user.role === 'admin').length;
      const activeUsers = users.filter(user => {
        if (!user.lastLogin) return false;
        const lastLogin = user.lastLogin.toDate();
        const now = new Date();
        const daysDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7; // Active if logged in within last 7 days
      }).length;

      const statsRef = doc(db, 'systemStats', 'current');
      await updateDoc(statsRef, {
        totalUsers,
        activeUsers,
        adminUsers,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating system stats:', error);
      throw error;
    }
  }

  async getSystemStats(): Promise<SystemStats | null> {
    try {
      const docSnap = await getDoc(doc(db, 'systemStats', 'current'));
      if (docSnap.exists()) {
        return docSnap.data() as SystemStats;
      }
      return null;
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToUsers(callback: (users: FirebaseUser[]) => void): () => void {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FirebaseUser[];
      callback(users);
    });
    return unsubscribe;
  }

  subscribeToActivityLogs(callback: (logs: ActivityLog[]) => void): () => void {
    const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as ActivityLog[];
      callback(logs);
    });
    return unsubscribe;
  }

  subscribeToSystemStats(callback: (stats: SystemStats | null) => void): () => void {
    const unsubscribe = onSnapshot(doc(db, 'systemStats', 'current'), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as SystemStats);
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
