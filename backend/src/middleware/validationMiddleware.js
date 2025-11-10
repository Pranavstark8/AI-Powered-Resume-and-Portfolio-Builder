// Input validation middleware for authentication routes

export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: "All fields are required: name, email, and password" 
    });
  }

  // Validate name
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      message: "Name must be at least 2 characters long" 
    });
  }

  if (name.length > 100) {
    return res.status(400).json({ 
      message: "Name must not exceed 100 characters" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: "Please provide a valid email address" 
    });
  }

  if (email.length > 255) {
    return res.status(400).json({ 
      message: "Email must not exceed 255 characters" 
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ 
      message: "Password must be at least 6 characters long" 
    });
  }

  if (password.length > 128) {
    return res.status(400).json({ 
      message: "Password must not exceed 128 characters" 
    });
  }

  // Check for password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return res.status(400).json({ 
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
    });
  }

  // Sanitize inputs (trim whitespace)
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: "Please provide a valid email address" 
    });
  }

  // Sanitize inputs
  req.body.email = email.trim().toLowerCase();

  next();
};

// Rate limiting helper (simple in-memory store)
const loginAttempts = new Map();

export const rateLimitLogin = (req, res, next) => {
  const email = req.body.email;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(email)) {
    loginAttempts.set(email, { count: 1, firstAttempt: now });
    return next();
  }

  const attempts = loginAttempts.get(email);
  const timePassed = now - attempts.firstAttempt;

  if (timePassed > windowMs) {
    // Reset if window has passed
    loginAttempts.set(email, { count: 1, firstAttempt: now });
    return next();
  }

  if (attempts.count >= maxAttempts) {
    const timeLeft = Math.ceil((windowMs - timePassed) / 60000);
    return res.status(429).json({ 
      message: `Too many login attempts. Please try again in ${timeLeft} minutes.` 
    });
  }

  attempts.count += 1;
  loginAttempts.set(email, attempts);
  next();
};

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [email, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > windowMs) {
      loginAttempts.delete(email);
    }
  }
}, 60 * 60 * 1000);


