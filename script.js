document.addEventListener('DOMContentLoaded', function() {
    const multiStepForm = document.getElementById('multiStepForm');
    const contactForm = document.getElementById('contactForm');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.getElementById('mainNavbar');
    const typeformSection = document.getElementById('typeformSection');
    const formExitBtn = document.getElementById('formExitBtn');
    
    let currentStep = 1;
    const totalSteps = 8;
    const formData = {};
    let isInTypeformMode = true;
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    if (formExitBtn) {
        formExitBtn.addEventListener('click', function() {
            exitTypeformMode();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isInTypeformMode) {
            exitTypeformMode();
        }
    });
    
    function exitTypeformMode() {
        isInTypeformMode = false;
        typeformSection.style.display = 'none';
        navbar.classList.remove('hidden');
        formExitBtn.classList.add('hidden');
        
        document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
    }
    
    function enterTypeformMode() {
        isInTypeformMode = true;
        typeformSection.style.display = 'flex';
        navbar.classList.add('hidden');
        formExitBtn.classList.remove('hidden');
        
        typeformSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (isInTypeformMode) {
        navbar.classList.add('hidden');
    }
    
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 25px rgba(0,0,0,0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    if (multiStepForm) {
        initializeMultiStepForm();
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            if (!validateContactForm(data)) {
                showMessage('Please fill in all required fields correctly.', 'error', contactForm.parentElement);
                return;
            }
            
            submitContactForm(data);
        });
    }
    
    function initializeMultiStepForm() {
        updateProgressBar();
        setupStepNavigation();
        setupInputValidation();
        
        multiStepForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitMultiStepLead();
        });
    }
    
    function setupStepNavigation() {
        const nextBtns = document.querySelectorAll('.next-btn');
        const prevBtns = document.querySelectorAll('.prev-btn');
        
        nextBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (validateCurrentStep()) {
                    saveCurrentStepData();
                    goToNextStep();
                }
            });
        });
        
        prevBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                goToPreviousStep();
            });
        });
    }
    
    function setupInputValidation() {
        const addressInput = document.querySelector('input[name="address"]');
        const nameInput = document.querySelector('input[name="name"]');
        const phoneInput = document.querySelector('input[name="phone"]');
        const emailInput = document.querySelector('input[name="email"]');
        
        if (addressInput) {
            addressInput.addEventListener('input', function() {
                const nextBtn = document.querySelector('[data-step="1"] .next-btn');
                const addressDetails = document.querySelector('.address-details');
                const validation = document.getElementById('address-validation');
                
                if (this.value.trim().length > 5) {
                    nextBtn.disabled = false;
                    addressDetails.style.display = 'grid';
                    addressDetails.style.marginTop = '20px';
                    this.classList.remove('invalid');
                    this.classList.add('valid');
                    showValidationMessage('address-validation', 'Looks good!', 'success');
                } else {
                    nextBtn.disabled = true;
                    addressDetails.style.display = 'none';
                    this.classList.remove('valid');
                    if (this.value.trim().length > 0) {
                        this.classList.add('invalid');
                        showValidationMessage('address-validation', 'Please enter a complete address', 'error');
                    } else {
                        this.classList.remove('invalid');
                        hideValidationMessage('address-validation');
                    }
                }
            });
        }
        
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const step = this.closest('.form-step');
                const nextBtn = step.querySelector('.next-btn');
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
            });
        });
        
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                validateNameField(this);
                checkContactStep();
            });
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                formatPhoneNumber(this);
                validatePhoneField(this);
                checkContactStep();
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                validateEmailField(this);
                checkContactStep();
            });
        }
        
        // Add scale option handling for commitment step
        document.querySelectorAll('.scale-option').forEach(option => {
            option.addEventListener('click', function() {
                const input = this.querySelector('input');
                input.checked = true;
                
                const step = this.closest('.form-step');
                const nextBtn = step.querySelector('.next-btn');
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
                
                const value = parseInt(input.value);
                let commitmentFeedback = document.querySelector('.commitment-feedback');
                if (!commitmentFeedback) {
                    const feedback = document.createElement('div');
                    feedback.className = 'commitment-feedback';
                    this.closest('.step-content').appendChild(feedback);
                    commitmentFeedback = feedback;
                }
                
                if (value >= 8) {
                    commitmentFeedback.innerHTML = 
                        '<div class="feedback-high"><i class="fas fa-star"></i> Excellent! You\'re ready to take action. We\'ll prioritize your situation and ensure you get our best offer.</div>';
                } else if (value >= 5) {
                    commitmentFeedback.innerHTML = 
                        '<div class="feedback-medium"><i class="fas fa-clock"></i> We understand. Let\'s see how we can help move things forward at your pace.</div>';
                } else {
                    commitmentFeedback.innerHTML = 
                        '<div class="feedback-low"><i class="fas fa-info-circle"></i> No pressure at all. We\'ll provide information to help you make the right decision when you\'re ready.</div>';
                }
            });
        });
        
        setTimeout(() => {
            updateSocialProofTicker();
        }, 5000);
    }
    
    function updateSocialProofTicker() {
        const ticker = document.querySelector('.recent-activity span');
        const activities = [
            'Mike from Annapolis just submitted - 3 minutes ago',
            'Jennifer from Frederick received her offer - 1 hour ago',
            'David from Baltimore just closed - 2 hours ago',
            'Lisa from Rockville got $89,000 cash - 4 hours ago'
        ];
        
        let currentIndex = 0;
        setInterval(() => {
            if (ticker) {
                currentIndex = (currentIndex + 1) % activities.length;
                ticker.textContent = activities[currentIndex];
            }
        }, 8000);
    }
    
    function validateCurrentStep() {
        const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required]');
        
        for (let input of requiredInputs) {
            if (input.type === 'radio') {
                const radioGroup = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) return false;
            } else if (!input.value.trim()) {
                return false;
            }
        }
        
        if (currentStep === 5) {
            const email = currentStepEl.querySelector('input[name="email"]').value;
            const phone = currentStepEl.querySelector('input[name="phone"]').value;
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return false;
            }
            
            if (phone.replace(/\D/g, '').length < 10) {
                return false;
            }
        }
        
        return true;
    }
    
    function saveCurrentStepData() {
        const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        const inputs = currentStepEl.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        });
        
        updateSummary();
    }
    
    function goToNextStep() {
        if (currentStep < totalSteps) {
            document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
            currentStep++;
            document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
            updateProgressBar();
            updateStepCounter();
            
            setTimeout(() => {
                const firstInput = document.querySelector(`[data-step="${currentStep}"] input:first-of-type`);
                if (firstInput && currentStep === 7) {
                    firstInput.focus();
                }
            }, 300);
        }
    }
    
    function goToPreviousStep() {
        if (currentStep > 1) {
            document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
            currentStep--;
            document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
            updateProgressBar();
            updateStepCounter();
        }
    }
    
    function updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const percentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = percentage + '%';
    }
    
    function updateStepCounter() {
        document.querySelector('.current-step').textContent = currentStep;
    }
    
    function validateNameField(input) {
        const validation = document.getElementById('name-validation');
        
        if (input.value.trim().length >= 2) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            showValidationMessage('name-validation', 'Perfect!', 'success');
        } else if (input.value.trim().length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            showValidationMessage('name-validation', 'Please enter your full name', 'error');
        } else {
            input.classList.remove('valid', 'invalid');
            hideValidationMessage('name-validation');
        }
    }
    
    function validatePhoneField(input) {
        const validation = document.getElementById('phone-validation');
        const cleanPhone = input.value.replace(/\D/g, '');
        
        if (cleanPhone.length === 10) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            showValidationMessage('phone-validation', 'Valid phone number', 'success');
        } else if (cleanPhone.length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            showValidationMessage('phone-validation', 'Please enter a valid 10-digit phone number', 'error');
        } else {
            input.classList.remove('valid', 'invalid');
            hideValidationMessage('phone-validation');
        }
    }
    
    function validateEmailField(input) {
        const validation = document.getElementById('email-validation');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailRegex.test(input.value)) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            showValidationMessage('email-validation', 'Valid email address', 'success');
        } else if (input.value.trim().length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            showValidationMessage('email-validation', 'Please enter a valid email address', 'error');
        } else {
            input.classList.remove('valid', 'invalid');
            hideValidationMessage('email-validation');
        }
    }
    
    function showValidationMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `validation-message show ${type}`;
            
            if (type === 'success') {
                element.innerHTML = `<i class="fas fa-check"></i> ${message}`;
            } else if (type === 'error') {
                element.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            }
        }
    }
    
    function hideValidationMessage(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('show');
        }
    }
    
    function checkContactStep() {
        const nameInput = document.querySelector('[data-step="7"] input[name="name"]');
        const phoneInput = document.querySelector('[data-step="7"] input[name="phone"]');
        const emailInput = document.querySelector('[data-step="7"] input[name="email"]');
        const nextBtn = document.querySelector('[data-step="7"] .next-btn');
        
        if (nameInput && phoneInput && emailInput && nextBtn) {
            const nameValid = nameInput.value.trim().length >= 2;
            const phoneValid = phoneInput.value.replace(/\D/g, '').length === 10;
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
            
            nextBtn.disabled = !(nameValid && phoneValid && emailValid);
        }
    }
    
    function updateSummary() {
        const summaryAddress = document.getElementById('summary-address');
        const summaryCondition = document.getElementById('summary-condition');
        const summaryTimeline = document.getElementById('summary-timeline');
        const summarySituation = document.getElementById('summary-situation');
        
        if (summaryAddress) {
            summaryAddress.textContent = 
                `${formData.address || ''}, ${formData.city || ''} ${formData.zipcode || ''}`.trim().replace(/^,\s*/, '');
        }
        if (summaryCondition) {
            summaryCondition.textContent = 
                formData.condition ? formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1) : '';
        }
        
        const summaryMotivation = document.getElementById('summary-motivation');
        const summaryUrgency = document.getElementById('summary-urgency');
        const summaryCommitment = document.getElementById('summary-commitment');
        
        if (summaryMotivation) {
            summaryMotivation.textContent = 
                formData.motivation ? formatMotivationText(formData.motivation) : '';
        }
        if (summaryUrgency) {
            summaryUrgency.textContent = 
                formData.urgency ? formatUrgencyText(formData.urgency) : '';
        }
        if (summaryCommitment) {
            summaryCommitment.textContent = formData.commitment || '';
        }
    }
    
    function formatTimelineText(timeline) {
        const timelineMap = {
            'asap': 'ASAP',
            '30-days': 'Within 30 days',
            '60-days': 'Within 60 days',
            'flexible': 'Flexible timeline'
        };
        return timelineMap[timeline] || timeline;
    }
    
    function formatMotivationText(motivation) {
        const motivationMap = {
            'financial-stress': 'Financial Pressure',
            'life-change': 'Major Life Change',
            'inherited-burden': 'Inherited Property Burden',
            'time-pressure': 'Time Crunch',
            'property-burden': 'Property Maintenance Issues',
            'other': 'Other Situation'
        };
        return motivationMap[motivation] || motivation;
    }
    
    function formatUrgencyText(urgency) {
        const urgencyMap = {
            'immediate': 'Extremely Urgent',
            'soon': 'Soon (2-4 weeks)',
            'flexible': 'Somewhat Flexible',
            'exploring': 'Just Exploring'
        };
        return urgencyMap[urgency] || urgency;
    }
    
    function submitMultiStepLead() {
        saveCurrentStepData();
        
        const urgencyLevel = formData.urgency;
        const commitmentLevel = parseInt(formData.commitment);
        
        let responseMessage = 'Thank you! We\'ve received your information.';
        
        if (urgencyLevel === 'immediate' || commitmentLevel >= 8) {
            responseMessage = 'PRIORITY SUBMISSION: Given your urgent situation, we\'re fast-tracking your case. Expect a call within 2 hours with your cash offer.';
        } else if (urgencyLevel === 'soon' || commitmentLevel >= 6) {
            responseMessage = 'Thank you! Based on your timeline, we\'ll contact you within 12 hours with a personalized cash offer.';
        } else {
            responseMessage = 'Thank you! We\'ll send you helpful information and follow up within 24 hours when you\'re ready.';
        }
        
        showMultiStepMessage('Submitting your information...', 'info');
        
        console.log('NEPQ-optimized lead data:', {
            ...formData,
            leadScore: calculateLeadScore(formData),
            urgencyLevel: urgencyLevel,
            commitmentLevel: commitmentLevel
        });
        
        setTimeout(() => {
            showMultiStepMessage(responseMessage, 'success');
            multiStepForm.reset();
            currentStep = 1;
            document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
            document.querySelector('[data-step="1"]').classList.add('active');
            updateProgressBar();
            updateStepCounter();
        }, 2000);
    }
    
    function calculateLeadScore(data) {
        let score = 0;
        
        if (data.urgency === 'immediate') score += 40;
        else if (data.urgency === 'soon') score += 30;
        else if (data.urgency === 'flexible') score += 15;
        
        if (data.consequences && data.consequences !== 'no-consequences') score += 25;
        
        const commitment = parseInt(data.commitment) || 0;
        score += commitment * 3;
        
        if (data.motivation === 'financial-stress') score += 20;
        else if (data.motivation === 'life-change') score += 15;
        
        return Math.min(score, 100);
    }
    
    function showMultiStepMessage(message, type) {
        removeExistingMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message multi-step-message`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        const typeformContainer = document.querySelector('.typeform-container');
        typeformContainer.insertBefore(messageDiv, multiStepForm);
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }
    
    function validateContactForm(data) {
        const required = ['contactName', 'contactPhone', 'contactEmail', 'contactMessage'];
        
        for (let field of required) {
            if (!data[field] || data[field].trim() === '') {
                return false;
            }
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.contactEmail)) {
            return false;
        }
        
        return true;
    }
    
    function submitContactForm(data) {
        showMessage('Sending your message...', 'info', contactForm.parentElement);
        
        console.log('Contact data:', data);
        
        setTimeout(() => {
            showMessage('Thank you for your message! We\'ll get back to you within 2 hours.', 'success', contactForm.parentElement);
            contactForm.reset();
        }, 2000);
    }
    
    function showMessage(message, type, container) {
        removeExistingMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        const targetForm = container.querySelector('form');
        container.insertBefore(messageDiv, targetForm);
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }
    
    function removeExistingMessages() {
        const existingMessages = document.querySelectorAll('.success-message, .error-message, .info-message');
        existingMessages.forEach(msg => msg.remove());
    }
    
    function formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
        } else if (value.length >= 3) {
            value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        }
        input.value = value;
    }
    
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            formatPhoneNumber(e.target);
        });
    });
    
    window.scrollToTop = function() {
        if (isInTypeformMode) {
            typeformSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    document.querySelectorAll('a[href*="#form"], .cta-button, .cta-button-secondary').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            enterTypeformMode();
        });
    });
});