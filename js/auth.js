// Firebase authentication wrapper with enhanced security and validation
class AuthService {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.currentUser = null;
    
    // Enhanced validation patterns
    this.patterns = {
      username: /^[a-zA-Z0-9_]{4,20}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    };

    // Setup auth state listener
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
    });
  }

  validateInput(type, value) {
    if (!this.patterns[type]) return { valid: true };

    const valid = this.patterns[type].test(value);
    const messages = {
      username: 'Username must be 4-20 characters long and can only contain letters, numbers and underscore',
      email: 'Please enter a valid email address',
      password: 'Password must be at least 8 characters long and contain at least one letter, one number and one special character'
    };

    return {
      valid,
      message: valid ? '' : messages[type]
    };
  }

  async signUp(username, email, password) {
    // Validate all inputs first
    const validations = [
      this.validateInput('username', username),
      this.validateInput('email', email),
      this.validateInput('password', password)
    ];

    const invalidInput = validations.find(v => !v.valid);
    if (invalidInput) {
      throw new Error(invalidInput.message);
    }

    try {
      // Create auth user
      const { user } = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Create user profile in Firestore (without password)
      await this.db.collection('users').doc(user.uid).set({
        uid: user.uid,
        username,
        email,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      // Send email verification
      await user.sendEmailVerification();
      
      return { user, needsEmailVerification: true };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signIn(email, password) {
    try {
      const { user } = await this.auth.signInWithEmailAndPassword(email, password);
      
      // Update last login
      await this.db.collection('users').doc(user.uid).update({
        lastLogin: new Date()
      });

      return user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signOut() {
    await this.auth.signOut();
  }

  handleAuthError(error) {
    // Map Firebase errors to user-friendly messages
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in or use a different email.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
      'auth/weak-password': 'Please choose a stronger password.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email. Please sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again.'
    };

    return new Error(errorMessages[error.code] || error.message);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async updateProfile(data) {
    if (!this.currentUser) throw new Error('No user logged in');
    
    const updates = {};
    if (data.username) {
      const validation = this.validateInput('username', data.username);
      if (!validation.valid) throw new Error(validation.message);
      updates.username = data.username;
    }

    await this.db.collection('users').doc(this.currentUser.uid).update(updates);
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
