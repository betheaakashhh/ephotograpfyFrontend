import React, { useState, useEffect } from 'react';
import { motion} from 'framer-motion';
import './landing.css';
import { useNavigate } from 'react-router-dom';

function Landing({ onEnter }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };
    
    const onButtonClick = (e) => {
        e.preventDefault();
        navigate('/ephotografy');
    };

    const features = [
        {
            icon: '🤖',
            title: 'AI-Powered Processing',
            description: 'Advanced AI removes backgrounds and formats photos instantly with precision'
        },
        {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Get professional passport photos in under 15 seconds'
        },
        {
            icon: '🎨',
            title: 'Custom Backgrounds',
            description: 'Choose from white, blue, red, or any custom color you need'
        },
        {
            icon: '📐',
            title: 'Perfect Standards',
            description: 'Auto-formats to official government standards (35×45mm, 51×51mm)'
        },
        {
            icon: '🖨️',
            title: 'Print-Ready Sheets',
            description: '300 DPI professional quality with 4, 6, or 8 photos per sheet'
        },
        {
            icon: '💾',
            title: 'Reprint Anytime',
            description: 'Job history lets you reprint any photo whenever needed'
        }
    ];

    const steps = [
        {
            number: '01',
            title: 'Upload Photo',
            description: 'Upload any front-facing photo with good lighting'
        },
        {
            number: '02',
            title: 'Customize',
            description: 'Select photo type, background color, and number of copies'
        },
        {
            number: '03',
            title: 'AI Processing',
            description: 'Our AI removes background, crops face, and formats perfectly'
        },
        {
            number: '04',
            title: 'Download & Print',
            description: 'Get your print-ready photo sheet instantly'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Photos Processed' },
        { value: '< 15s', label: 'Processing Time' },
        { value: '99.9%', label: 'Accuracy Rate' },
        { value: '24/7', label: 'Availability' }
    ];

    return (
        <div className="landing-container">
            
            {/* Animated Background */}
            <div className="animated-background">
                <motion.div
                    className="gradient-orb orb-1"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className="gradient-orb orb-2"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className="gradient-orb orb-3"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            </div>

            {/* Mouse Follower Effect */}
            <motion.div
                className="mouse-glow"
                animate={{
                    x: `${mousePosition.x}%`,
                    y: `${mousePosition.y}%`
                }}
                transition={{
                    type: 'spring',
                    stiffness: 50,
                    damping: 30
                }}
            />

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >   <motion.div className="top-icon" variants={itemVariants}>
                        <span>ephotografy Studio</span>
                  
                        <i class="fa-solid fa-arrow-right-from-bracket" onClick={onButtonClick}></i>
                   
                        
                    </motion.div>
                    
                    <motion.div className="logo-badge" variants={itemVariants}>
                        <i className="fas fa-camera-retro"></i>
                        <span>ePhotography AI Studio</span>
                    </motion.div>

                    <motion.h1 className="hero-title" variants={itemVariants}>
                        AI-Powered Passport &<br />
                        <span className="gradient-text">Visa Photo Generator</span>
                    </motion.h1>

                    <motion.p className="hero-subtitle" variants={itemVariants}>
                        Upload a photo, choose background color, select photo type, and get a<br />
                        professional passport photo sheet instantly. No Photoshop. No manual editing.<br />
                        <span className="highlight">Just AI.</span>
                    </motion.p>

                    <motion.div className="hero-badges" variants={itemVariants}>
                        <span className="badge">⚡ Fast</span>
                        <span className="badge">🎯 Accurate</span>
                        <span className="badge">🖨️ Print-Ready</span>
                    </motion.div>

                    <motion.div className="hero-cta" variants={itemVariants}>
                        <motion.button
                            className="cta-button primary"
                            onClick={onButtonClick}
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)' }}
                            whileTap={{ scale: 0.95 }}

                        >
                            <span>Get Started Now</span>
                            <i className="fas fa-arrow-right"></i>
                        </motion.button>
                        <motion.button
                            className="cta-button secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="fas fa-play-circle"></i>
                            <span>Watch Demo</span>
                        </motion.button>
                    </motion.div>

                    <motion.div className="stats-row" variants={itemVariants}>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="stat-item"
                                whileHover={{ y: -5 }}
                            >
                                <h3>{stat.value}</h3>
                                <p>{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div
                    className="hero-visual"
                    variants={floatingVariants}
                    animate="animate"
                >
                    <div className="glass-card featured-card">
                        <div className="card-glow"></div>
                        <i className="fas fa-id-card-alt"></i>
                        <h3>Professional Quality</h3>
                        <p>Government-standard passport photos</p>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>What ePhotography Does</h2>
                    <p>Powered by cutting-edge AI technology</p>
                </motion.div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="glass-card feature-card"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                        >
                            <div className="card-glow"></div>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="process-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>How It Works</h2>
                    <p>Four simple steps to professional photos</p>
                </motion.div>

                <div className="process-timeline">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="glass-card timeline-item"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="card-glow"></div>
                            <div className="step-number">{step.number}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                            {index < steps.length - 1 && (
                                <div className="timeline-connector">
                                    <i className="fas fa-arrow-down"></i>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Technology Section */}
            <section className="tech-section">
                <motion.div
                    className="glass-card tech-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="card-glow"></div>
                    <h2>⚙️ Powered By Advanced Technology</h2>
                    <div className="tech-stack">
                        <div className="tech-item">
                            <i className="fab fa-react"></i>
                            <span>React</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-node-js"></i>
                            <span>Node.js</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-python"></i>
                            <span>Python AI</span>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-database"></i>
                            <span>MongoDB</span>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-brain"></i>
                            <span>Rembg AI</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Who Is This For Section */}
            <section className="audience-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Who Is This For?</h2>
                    <p>Perfect for professionals and individuals</p>
                </motion.div>

                <div className="audience-grid">
                    {[
                        { icon: '📸', title: 'Photo Studios', desc: 'Automate your passport photo service' },
                        { icon: '💻', title: 'Cyber Cafés', desc: 'Offer instant photo processing' },
                        { icon: '🏛️', title: 'Document Centers', desc: 'Fast government-standard photos' },
                        { icon: '👤', title: 'Individuals', desc: 'DIY professional passport photos' },
                        { icon: '🎨', title: 'Freelancers', desc: 'Quick client photo solutions' },
                        { icon: '🌍', title: 'Travel Agencies', desc: 'Help clients with visa photos' }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="glass-card audience-card"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                        >
                            <div className="card-glow"></div>
                            <div className="audience-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="final-cta-section">
                <motion.div
                    className="glass-card cta-card"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="card-glow large"></div>
                    <h2>Ready to Create Professional Photos?</h2>
                    <p>Your AI Photo Studio in the Browser</p>
                    <p className="subtitle">Upload. Process. Print.</p>
                    <motion.button
                        className="cta-button primary large"
                        onClick={onEnter}
                        whileHover={{ scale: 1.05, boxShadow: '0 30px 80px rgba(99, 102, 241, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Start Creating Now</span>
                        <i className="fas fa-rocket"></i>
                    </motion.button>
                    <div className="cta-features">
                        <span><i className="fas fa-check-circle"></i> No Photoshop Required</span>
                        <span><i className="fas fa-check-circle"></i> Instant AI Processing</span>
                        <span><i className="fas fa-check-circle"></i> Professional Quality</span>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <i className="fas fa-camera-retro"></i>
                        <h3>ePhotography AI Studio</h3>
                        <p>Professional Photos Without Photoshop</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Features</button>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>How It Works</button>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Pricing</button>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>About Us</button>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Contact</button>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Careers</button>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Privacy Policy</button>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Terms of Service</button>
                            <button onClick={() => {}} style={{ background: 'none', border: 'none', padding: 0, color: '#9ca3af', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '12px' }}>Cookie Policy</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2024 ePhotography AI Studio. All rights reserved.</p>
                    <div className="social-links">
                        <button onClick={() => {}} aria-label="Twitter" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%', color: '#9ca3af', cursor: 'pointer' }}>
                            <i className="fab fa-twitter"></i>
                        </button>
                        <button onClick={() => {}} aria-label="Facebook" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%', color: '#9ca3af', cursor: 'pointer' }}>
                            <i className="fab fa-facebook"></i>
                        </button>
                        <button onClick={() => {}} aria-label="Instagram" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%', color: '#9ca3af', cursor: 'pointer' }}>
                            <i className="fab fa-instagram"></i>
                        </button>
                        <button onClick={() => {}} aria-label="LinkedIn" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%', color: '#9ca3af', cursor: 'pointer' }}>
                            <i className="fab fa-linkedin"></i>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;