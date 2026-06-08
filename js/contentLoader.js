// Content loader for fetching data from content.json
// Google Sheet configuration for Membership data
const MEMBERSHIP_SHEET_ID = '1ykvrLVy3uWkyHRTg7bRYnitSo2v8YsISX2I3ojtvl74';
const MEMBERSHIP_SHEET_GID = '1304605237';

class ContentLoader {
    constructor() {
        this.contentUrl = 'content.json';
        this.cache = null;
        this.loadingPromise = null;
        this.isLocalFile = window.location.protocol === 'file:';
        this.debugMode = true; // Enable debug logging
        this.basePath = this.isLocalFile ? this.getLocalBasePath() : '';
        console.log('ContentLoader initialized. Protocol:', window.location.protocol, 'Is local file:', this.isLocalFile, 'Base path:', this.basePath);
    }

    // Get local base path for file:// protocol
    getLocalBasePath() {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        
        // Remove the filename from the path
        pathParts.pop();
        
        // Build the base path
        let basePath = pathParts.join('/');
        
        // Handle Windows file paths
        if (basePath.startsWith('C:') || basePath.startsWith('D:')) {
            basePath = 'file:///' + basePath.replace(/\\/g, '/');
        } else if (basePath.startsWith('/')) {
            basePath = 'file://' + basePath;
        }
        
        console.log('Local base path calculated:', basePath);
        return basePath;
    }

    // Resolve image paths for different environments
    resolveImagePath(imagePath) {
        if (!imagePath) return imagePath;

        imagePath = String(imagePath).replace(/\\/g, '/');

        // Keep deployed/intranet paths relative. Older local edits may have saved
        // file:///C:/.../images/name.jpg, which cannot load from another computer.
        const imagesIndex = imagePath.toLowerCase().lastIndexOf('/images/');
        if (!this.isLocalFile && imagesIndex >= 0) {
            return imagePath.substring(imagesIndex + 1);
        }
        if (!this.isLocalFile && imagePath.toLowerCase().startsWith('file:')) {
            return imagePath.replace(/^file:\/\/\/?/i, '').replace(/^.*?images\//i, 'images/');
        }
        
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('file://')) {
            return imagePath;
        }
        
        // For local file protocol, prepend base path
        if (this.isLocalFile && this.basePath) {
            // Remove leading slash if present
            const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            const resolvedPath = this.basePath + '/' + cleanPath;
            console.log('Resolved image path:', imagePath, '->', resolvedPath);
            return resolvedPath;
        }
        
        // For HTTP/HTTPS, return relative path as is
        return imagePath;
    }

    // Process content to resolve all image paths
    processContentPaths(content) {
        console.log('Processing content paths...');
        
        // Process background slideshow paths
        const pages = ['homepage', 'aboutContent', 'contactContent', 'committeeContent', 'eventsContent', 'upcomingContent', 'membershipContent'];
        
        pages.forEach(page => {
            if (content[page] && content[page].backgroundSlideshow) {
                content[page].backgroundSlideshow = content[page].backgroundSlideshow.map(path => {
                    const resolvedPath = this.resolveImagePath(path);
                    if (resolvedPath !== path) {
                        console.log(`Resolved ${page} background slideshow path:`, path, '->', resolvedPath);
                    }
                    return resolvedPath;
                });
            }
            
            if (content[page] && content[page].backgroundImage) {
                content[page].backgroundImage = this.resolveImagePath(content[page].backgroundImage);
            }
        });
        
        // Process homepage header background image
        if (content.homepage && content.homepage.header && content.homepage.header.backgroundImage) {
            content.homepage.header.backgroundImage = this.resolveImagePath(content.homepage.header.backgroundImage);
        }
        
        // Process homepage header background slideshow
        if (content.homepage && content.homepage.header && content.homepage.header.backgroundSlideshow) {
            content.homepage.header.backgroundSlideshow = content.homepage.header.backgroundSlideshow.map(path => {
                return this.resolveImagePath(path);
            });
        }
        
        // Process leaders photos
        if (content.homepage && content.homepage.leaders) {
            content.homepage.leaders.forEach(leader => {
                if (leader.photo) {
                    leader.photo = this.resolveImagePath(leader.photo);
                }
            });
        }
        
        // Process gallery images
        if (content.homepage && content.homepage.gallery) {
            content.homepage.gallery.forEach(item => {
                if (item.image) {
                    item.image = this.resolveImagePath(item.image);
                }
            });
        }
        
        // Process committee members photos
        if (content.committeeMembers) {
            console.log('Processing committee members photos. Type:', typeof content.committeeMembers, 'Is array:', Array.isArray(content.committeeMembers));
            
            // Handle both array and object formats
            const membersArray = Array.isArray(content.committeeMembers) 
                ? content.committeeMembers 
                : Object.values(content.committeeMembers);
            
            console.log('Committee members array length:', membersArray.length);
            
            membersArray.forEach(member => {
                if (member.image) {
                    member.image = this.resolveImagePath(member.image);
                }
            });
        }
        
        // Process upcoming events images
        if (content.upcomingEvents) {
            content.upcomingEvents.forEach(event => {
                if (event.image) {
                    event.image = this.resolveImagePath(event.image);
                }
            });
        }

        // Process past events images and slideshow media
        if (content.pastEvents) {
            const pastEventsArray = Array.isArray(content.pastEvents) ? content.pastEvents : Object.values(content.pastEvents);
            pastEventsArray.forEach(event => {
                if (event.image) {
                    event.image = this.resolveImagePath(event.image);
                }
                if (Array.isArray(event.slideshowImages)) {
                    event.slideshowImages = event.slideshowImages.map(path => this.resolveImagePath(path));
                }
            });
        }
        
        // Process logos
        if (content.logo) {
            content.logo = this.resolveImagePath(content.logo);
        }
        if (content.logo2) {
            content.logo2 = this.resolveImagePath(content.logo2);
        }
        
        console.log('Content path processing completed');
        return content;
    }

    // Force refresh cache - useful for debugging
    forceRefresh() {
        console.log('Force refreshing content cache');
        this.cache = null;
        this.loadingPromise = null;
        return this.loadContent();
    }

    // Get current loading status
    getStatus() {
        return {
            hasCache: !!this.cache,
            isLoading: !!this.loadingPromise,
            isLocalFile: this.isLocalFile,
            protocol: window.location.protocol,
            url: window.location.href
        };
    }

    async loadContent() {
        console.log('loadContent called. Cache:', this.cache, 'Loading promise:', this.loadingPromise);
        // Return cached content if available
        if (this.cache) {
            console.log('Returning cached content');
            return this.cache;
        }

        // If already loading, return the existing promise
        if (this.loadingPromise) {
            console.log('Returning existing loading promise');
            return this.loadingPromise;
        }

        // Create the loading promise
        this.loadingPromise = this.loadContentInternal();
        
        try {
            const result = await this.loadingPromise;
            return result;
        } finally {
            this.loadingPromise = null;
        }
    }

    async loadContentInternal() {
        console.log('loadContentInternal called. Is local file:', this.isLocalFile);
        let result;

        try {
            result = await this.loadFromContentJs();
            console.log('Loaded from content.js successfully');
        } catch (contentJsError) {
            console.warn('Failed to load from content.js, falling back to content.json', contentJsError);
        }

        if (result) {
            result = this.processContentPaths(result);
            this.cache = result;
            console.log('Content loading and processing completed');
            return result;
        }

        // For file protocol (opening HTML directly), try to load from content.json
        if (this.isLocalFile) {
            console.log('Loading from JSON in local file mode');
            try {
                result = await this.loadFromJson();
                console.log('Loaded from JSON successfully in local file mode');
            } catch (error) {
                console.warn('Failed to load from content.json in local file mode, falling back to directory scanning', error);
                result = this.getDefaultDirectoryContent();
                console.log('Using fallback content for local file mode');
            }
        } else {
            // For HTTP/HTTPS (server or GitHub), try to load from content.json first
            console.log('Loading from JSON in HTTP/HTTPS mode');
            try {
                result = await this.loadFromJson();
                console.log('Loaded from JSON successfully in HTTP/HTTPS mode');
            } catch (error) {
                console.warn('Failed to load from content.json in HTTP/HTTPS mode, falling back to directory scanning', error);
                // Fall back to bundled default content
                result = this.getDefaultDirectoryContent();
                console.log('Using fallback content for HTTP/HTTPS mode');
            }
        }

        // Process all image paths in the content
        result = this.processContentPaths(result);
        
        // Cache the processed result
        this.cache = result;
        console.log('Content loading and processing completed');
        return result;
    }

    loadFromContentJs() {
        if (window.AGA_CONTENT) {
            return Promise.resolve(this.cloneContent(window.AGA_CONTENT));
        }

        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-aga-content]');
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    window.AGA_CONTENT ? resolve(this.cloneContent(window.AGA_CONTENT)) : reject(new Error('content.js loaded but AGA_CONTENT was not found'));
                }, { once: true });
                existingScript.addEventListener('error', () => reject(new Error('content.js failed to load')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = 'content.js';
            script.dataset.agaContent = 'true';
            script.onload = () => {
                window.AGA_CONTENT ? resolve(this.cloneContent(window.AGA_CONTENT)) : reject(new Error('content.js loaded but AGA_CONTENT was not found'));
            };
            script.onerror = () => reject(new Error('content.js failed to load'));
            document.head.appendChild(script);
        });
    }

    cloneContent(content) {
        return JSON.parse(JSON.stringify(content));
    }

    async loadFromJson() {
        console.log('loadFromJson called. Is local file:', this.isLocalFile);
        
        // Try multiple approaches for better compatibility
        const approaches = [];
        
        // Try XHR first for better local file support
        approaches.push(this.loadFromJsonXHR.bind(this));
        // Add fetch as fallback for HTTP/HTTPS environments
        if (!this.isLocalFile) {
            approaches.push(this.loadFromJsonFetch.bind(this));
        }
        
        for (let i = 0; i < approaches.length; i++) {
            try {
                console.log(`Trying approach ${i + 1} of ${approaches.length}`);
                const result = await approaches[i]();
                console.log(`Approach ${i + 1} succeeded`);
                return result;
            } catch (error) {
                console.warn(`Approach ${i + 1} failed:`, error.message);
                if (i === approaches.length - 1) {
                    // Last approach failed
                    throw error;
                }
            }
        }
    }

    async loadFromJsonFetch() {
        console.log('Trying to load with fetch');
        const response = await fetch(this.contentUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Successfully loaded with fetch');
        // Process content paths before returning
        return this.processContentPaths(data);
    }

    async loadFromJsonXHR() {
        console.log('Trying to load with XMLHttpRequest');
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.contentUrl, true);
            xhr.timeout = 10000; // 10 second timeout
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('XMLHttpRequest readyState:', xhr.readyState, 'status:', xhr.status);
                    // For local files, we need to handle both status 200 (HTTP) and status 0 (file://)
                    if (xhr.status === 200 || xhr.status === 0) { // status 0 for file protocol
                        try {
                            // For local files, responseText might be available even with status 0
                            const data = JSON.parse(xhr.responseText || xhr.response);
                            console.log('Successfully loaded with XMLHttpRequest');
                            // Process content paths before resolving
                            const processedData = this.processContentPaths(data);
                            resolve(processedData);
                        } catch (parseError) {
                            console.error('JSON parse error:', parseError);
                            // If parsing fails but we have response text, try to handle it
                            if (xhr.responseText) {
                                try {
                                    // Try to parse response text directly
                                    const data = JSON.parse(xhr.responseText);
                                    console.log('Successfully loaded with XMLHttpRequest (fallback)');
                                    // Process content paths before resolving
                                    const processedData = this.processContentPaths(data);
                                    resolve(processedData);
                                } catch (fallbackError) {
                                    console.error('Fallback JSON parse error:', fallbackError);
                                    reject(fallbackError);
                                }
                            } else {
                                reject(parseError);
                            }
                        }
                    } else {
                        const error = new Error(`HTTP error! status: ${xhr.status}`);
                        console.error('HTTP error:', error);
                        reject(error);
                    }
                }
            };
            
            xhr.ontimeout = function() {
                const error = new Error('Request timeout');
                console.error('Timeout error:', error);
                reject(error);
            };
            
            xhr.onerror = function() {
                const error = new Error('Network error');
                console.error('Network error:', error);
                reject(error);
            };
            
            console.log('Sending XMLHttpRequest to:', this.contentUrl);
            xhr.send();
        });
    }

    async loadFromDirectory() {
        // This is a fallback method for static hosting environments
        // In a real implementation, this would scan the filesystem for content
        // For now, we return a minimal default structure
        console.log('Loading content from directory structure (fallback mode)');
        
        // Return default structure with directory-based content
        return this.getDefaultDirectoryContent();
    }

    getDefaultContent() {
        return {
            registrationNumber: "01/01/01/40737/24",
            logo: "images/aga_club_logo.jpg",
            logo2: "images/logo-english.png",
            homepage: {
                header: {
                    title: "Welcome to AGA Club Bhel Bhopal",
                    subtitle: "Celebrating Community, Culture, and Togetherness",
                    backgroundImage: "images/hero-bg.jpg",
                    backgroundSlideshow: [
                        "images/hero-bg.jpg",
                        "images/holi.jpg",
                        "images/garba.jpg",
                        "images/diwali.jpg",
                        "images/basketball.jpg"
                    ]
                },
                leaders: [],
                gallery: []
            },
            upcomingEvents: [
                            {
                                "id": 1,
                                "name": "Navankur",
                                "date": "December 22, 2025",
                                "venue": "Club Ground",
                                "description": "Traditional tree planting ceremony to celebrate new beginnings and environmental consciousness.",
                                "formLink": "",
                                "image": "images/navankur.jpg"
                            },
                            {
                                "id": 2,
                                "name": "New Year Celebration",
                                "date": "January 1, 2026",
                                "venue": "Club Ground",
                                "description": "Ring in the new year with music, dance, and cultural performances. Refreshments will be served.",
                                "formLink": "",
                                "image": "images/new-year.jpg"
                            },
                            {
                                "id": 3,
                                "name": "Republic Day Celebration",
                                "date": "January 26, 2026",
                                "venue": "Main Hall",
                                "description": "Patriotic celebration featuring flag hoisting ceremony, cultural programs, and community lunch.",
                                "formLink": "",
                                "image": "images/republic-day.jpg"
                            }
                        ],
            pastEvents: [],
            committeeMembers: [
                {
                    "id": 1,
                    "name": "Shri Vipul Agrawal",
                    "position": "President",
                    "image": "images/VIPUL AGRAWAL.jpg"
                },
                {
                    "id": 2,
                    "name": "Shri Prashant Pathak",
                    "position": "Vice President",
                    "image": "images/Prashant-Pathak.jpg"
                },
                {
                    "id": 3,
                    "name": "Shri Vedprakash Sharma",
                    "position": "General Secretary",
                    "image": "images/Shri Vedprakash Sharma.jpg"
                },
                {
                    "id": 4,
                    "name": "Shri Rakesh Kumar Shakya",
                    "position": "Joint Secretary",
                    "image": "images/Shri Rakesh Kumar Shakya.jpg"
                },
                {
                    "id": 5,
                    "name": "Yogesh Sarathe",
                    "position": "Cultural Secretary",
                    "image": "images/Yogesh Sarathe.jpg"
                },
                {
                    "id": 6,
                    "name": "Abhay Kumar Saxena",
                    "position": "Treasurer",
                    "image": "images/Abhay Kumar Saxena.jpg"
                },
                {
                    "id": 7,
                    "name": "Shri Anand Jaiswal",
                    "position": "Member",
                    "image": "images/Shri Anand Jaiswal.jpg"
                },
                {
                    "id": 8,
                    "name": "Shri Arun Sahu",
                    "position": "Member",
                    "image": "images/Shri Arun Sahu.jpg"
                },
                {
                    "id": 9,
                    "name": "Shri Birendra Singh",
                    "position": "Member",
                    "image": "images/Shri Birendra Singh.jpg"
                },
                {
                    "id": 10,
                    "name": "Shri C.K. Sharma",
                    "position": "Member",
                    "image": "images/Shri C.K. Sharma.jpg"
                },
                {
                    "id": 11,
                    "name": "Shri Jay Parihar",
                    "position": "Member",
                    "image": "images/Shri Jay Parihar.jpg"
                },
                {
                    "id": 12,
                    "name": "Shri Mahendra Thakre",
                    "position": "Member",
                    "image": "images/Shri Mahendra Thakre.jpg"
                },
                {
                    "id": 13,
                    "name": "Shri Nirmal Kumar Bowade",
                    "position": "Member",
                    "image": "images/Shri Nirmal Kumar Bovade.jpg"
                },
                {
                    "id": 14,
                    "name": "Shri Rajesh Barman",
                    "position": "Member",
                    "image": "images/Shri Rajesh Barman.jpg"
                },
                {
                    "id": 15,
                    "name": "Shri Ravi Yadav",
                    "position": "Member",
                    "image": "images/Shri Ravi Yadav.jpg"
                },
                {
                    "id": 16,
                    "name": "Shri Sandeep Lokhande",
                    "position": "Member",
                    "image": "images/Shri Sandeep Lokhande.jpg"
                },
                {
                    "id": 17,
                    "name": "Shri Sonu Kushwaha",
                    "position": "Member",
                    "image": "images/Shri Sonu Kushwaha.jpg"
                },
                {
                    "id": 18,
                    "name": "Shri Sunderlal",
                    "position": "Member",
                    "image": "images/Shri Sunderlal.jpg"
                },
                {
                    "id": 19,
                    "name": "Shri Upendra Prasad",
                    "position": "Member",
                    "image": "images/Shri Upendra Prasad.jpg"
                },
                {
                    "id": 20,
                    "name": "Shri Vimal Kumar Sahu",
                    "position": "Member",
                    "image": "images/Shri Vimal Kumar Sahu.jpg"
                },
                {
                    "id": 21,
                    "name": "Shri Vinay Savita",
                    "position": "Member",
                    "image": "images/Shri Vinay Savita.jpg"
                },
                {
                    "id": 22,
                    "name": "Shri Vinod Sahu",
                    "position": "Member",
                    "image": "images/Shri Vinod Sahu.jpg"
                }
            ],
            aboutContent: {},
            contactContent: {},
            committeeContent: {},
            eventsContent: {},
            upcomingContent: {}
        };
    }

    getDefaultDirectoryContent() {
        // Return content structure based on directory scanning
        // Note: This is a fallback method and should only include events that can be verified to exist
        return {
            registrationNumber: "01/01/01/40737/24",
            logo: "images/aga_club_logo.jpg",
            logo2: "images/logo-english.png",
            homepage: {
                header: {
                    title: "Welcome to AGA Club Bhel Bhopal",
                    subtitle: "Celebrating Community, Culture, and Togetherness",
                    backgroundImage: "images/hero-bg.jpg",
                    backgroundSlideshow: [
                        "images/hero-bg.jpg",
                        "images/holi.jpg",
                        "images/garba.jpg",
                        "images/diwali.jpg",
                        "images/basketball.jpg"
                    ]
                },
                leaders: [
                    {
                        "id": 1,
                        "name": "President - Shri Vipul Agrawal",
                        "photo": "images/president.jpg",
                        "messageTitle": "President's Message",
                        "message": "आगा क्लब आनंद के साथ जीवन जीने का एक माध्यम है। इसके कार्यों के साथ जुड़कर मैं भी आनंदित महसूस कर रहा हूँ, आगा क्लब अपने सभी सदस्यों के साथ मिलकर तरक्की करे, ऐसी मेरी शुभकामनाएं हैं।",
                        "fullMessage": "आगा क्लब आनंद के साथ जीवन जीने का एक माध्यम है। इसके कार्यों के साथ जुड़कर मैं भी आनंदित महसूस कर रहा हूँ, आगा क्लब अपने सभी सदस्यों के साथ मिलकर तरक्की करे, ऐसी मेरी शुभकामनाएं हैं। - विपुल अग्रवाल"
                    },
                    {
                        "id": 2,
                        "name": "General Secretary - Shri Ved Prakash Sharma",
                        "photo": "images/secretary.jpg",
                        "messageTitle": "General Secretary's Message",
                        "message": "यह क्लब केवल एक समूह नहीं, बल्कि प्रतिभा, रचनात्मकता और परंपराओं का एक जीवंत संगम है। हमारे क्लब का उद्देश्य अपने सदस्यों एवँ उनके परिजनों की कलात्मक प्रतिभाओं को पहचानना, उन्हें एक मंच प्रदान करना और विभिन्न खेलकूद गतिविधियों एवँ  सांस्कृतिक गतिविधियों जैसे प्रतियोगिताओं,उत्सव, प्रदर्शनियों और कार्यशालाओं के माध्यम से एकता और समझ को बढ़ावा देना है। ",
                        "fullMessage": "यह क्लब केवल एक समूह नहीं, बल्कि प्रतिभा, रचनात्मकता और परंपराओं का एक जीवंत संगम है। हमारे क्लब का उद्देश्य अपने सदस्यों एवँ उनके परिजनों की कलात्मक प्रतिभाओं को पहचानना, उन्हें एक मंच प्रदान करना और विभिन्न खेलकूद गतिविधियों एवँ  सांस्कृतिक गतिविधियों जैसे प्रतियोगिताओं,उत्सव, प्रदर्शनियों और कार्यशालाओं के माध्यम से एकता और समझ को बढ़ावा देना है। मुझे विश्वास है कि आपके सहयोग से हम आने वाले वर्ष में कई नई ऊंचाइयों को छुएंगे। -  वेद प्रकाश शर्मा"
                    }
                ],
                gallery: [
                    {
                        "id": 1,
                        "image": "images/holi.jpg",
                        "alt": "Holi Milan Samaroh"
                    },
                    {
                        "id": 2,
                        "image": "images/garba.jpg",
                        "alt": "Garba Mahotsav"
                    },
                    {
                        "id": 3,
                        "image": "images/diwali.jpg",
                        "alt": "Diwali Milan Samaroh"
                    },
                    {
                        "id": 4,
                        "image": "images/basketball.jpg",
                        "alt": "Basketball Tournament"
                    },
                    {
                        "id": 5,
                        "image": "images/sports-day.jpg",
                        "alt": "Annual Sports Day"
                    },
                    {
                        "id": 6,
                        "image": "images/children-compitition.jpg",
                        "alt": "Children's Competition"
                    },
                    {
                        "id": 7,
                        "image": "images/mothers-day.jpg",
                        "alt": "Mother's Day Celebration"
                    }
                ]
            },
            upcomingEvents: [
                {
                    "id": 1,
                    "name": "Navankur",
                    "date": "December 22, 2025",
                    "venue": "Club Ground",
                    "description": "Traditional tree planting ceremony to celebrate new beginnings and environmental consciousness.",
                    "formLink": "",
                    "image": "images/navankur.jpg"
                },
                {
                    "id": 2,
                    "name": "New Year Celebration",
                    "date": "January 1, 2026",
                    "venue": "Club Ground",
                    "description": "Ring in the new year with music, dance, and cultural performances. Refreshments will be served.",
                    "formLink": "",
                    "image": "images/new-year.jpg"
                },
                {
                    "id": 3,
                    "name": "Republic Day Celebration",
                    "date": "January 26, 2026",
                    "venue": "Main Hall",
                    "description": "Patriotic celebration featuring flag hoisting ceremony, cultural programs, and community lunch.",
                    "formLink": "",
                    "image": "images/republic-day.jpg"
                }
            ],
            pastEvents: [
                {
                    "id": 1,
                    "name": "Letter from Grandson Competition",
                    "date": "June 2025",
                    "description": "Creative letter writing competition encouraging grandchildren to express their thoughts and feelings to their grandparents.",
                    "image": "images/letter from grandson competition1.jpg",
                    "slideshowImages": [
                        "images/letter from grandson competition1.jpg",
                        "images/letter from grandson competition2.jpg",
                        "images/letter from grandson competition3.jpg",
                        "images/letter from grandson competition4.jpg",
                        "images/letter from grandson competition5.jpg",
                        "images/letter from grandson competition6.jpg",
                        "images/letter from grandson competition7.jpg",
                        "images/letter from grandson competition8.jpg"
                    ]
                },
                {
                    "id": 2,
                    "name": "Plantation Program",
                    "date": "July 2025",
                    "description": "Community initiative to plant trees and promote environmental awareness.",
                    "image": "images/plantation program1.jpg",
                    "slideshowImages": [
                        "images/plantation program1.jpg",
                        "images/plantation program2.jpg",
                        "images/plantation program3.jpg",
                        "images/plantation program4.jpg",
                        "images/plantation program5.jpg"
                    ]
                },
                {
                    "id": 3,
                    "name": "Memento Distribution",
                    "date": "April 2025",
                    "description": "Distribution of memorial items to honor the contributions of esteemed community members.",
                    "image": "images/memento distribution1.jpg",
                    "slideshowImages": [
                        "images/memento distribution1.jpg",
                        "images/memento distribution2.jpg",
                        "images/memento distribution3.jpg",
                        "images/memento distribution4.jpg",
                        "images/memento distribution5.jpg",
                        "images/memento distribution6.jpg",
                        "images/memento distribution7.jpg",
                        "images/memento distribution8.jpg",
                        "images/memento distribution9.jpg",
                        "images/memento distribution10.jpg",
                        "images/memento distribution11.jpg",
                        "images/memento distribution12.jpg"
                    ]
                },
                {
                    "id": 4,
                    "name": "Independence Day",
                    "date": "August 2025",
                    "description": "Patriotic celebration of India's independence with flag hoisting and cultural programs.",
                    "image": "images/independence day1.jpg",
                    "slideshowImages": [
                        "images/independence day1.jpg",
                        "images/independence day2.jpg",
                        "images/independence day3.jpg",
                        "images/independence day4.jpg"
                    ]
                },
                {
                    "id": 5,
                    "name": "Committee Member Retirement Program",
                    "date": "December 2025",
                    "description": "Honoring our dedicated committee members for their years of service to the community.",
                    "image": "images/committee member retirement program1.jpg",
                    "slideshowImages": [
                        "images/committee member retirement program1.jpg",
                        "images/committee member retirement program2.jpg",
                        "images/committee member retirement program3.jpg",
                        "images/committee member retirement program4.jpg",
                        "images/committee member retirement program5.jpg",
                        "images/committee member retirement program6.jpg",
                        "images/committee member retirement program7.jpg"
                    ]
                },
                {
                    "id": 6,
                    "name": "Cycle-Riding",
                    "date": "",
                    "description": "Community cycling event promoting health and environmental awareness.",
                    "image": "images/cycle-riding1.jpg",
                    "slideshowImages": [
                        "images/cycle-riding1.jpg",
                        "images/cycle-riding2.jpg",
                        "images/cycle-riding3.jpg",
                        "images/cycle-riding4.jpg"
                    ]
                },
                {
                    "id": 7,
                    "name": "Diwali Milan",
                    "date": "October 2025",
                    "description": "The festival of lights celebrated with decorations, sweets, and cultural performances.",
                    "image": "images/Diwali-milan1.jpg",
                    "slideshowImages": [
                        "images/Diwali-milan1.jpg",
                        "images/Diwali-milan2.jpg",
                        "images/Diwali-milan3.jpg",
                        "images/Diwali-milan4.jpg",
                        "images/Diwali-milan5.jpg",
                        "images/Diwali-milan6.jpg",
                        "images/Diwali-milan7.jpg",
                        "images/Diwali-milan8.jpg",
                        "images/Diwali-milan9.jpg",
                        "images/Diwali-milan10.jpg",
                        "images/Diwali-milan11.jpg"
                    ]
                },
                {
                    "id": 8,
                    "name": "Garba Mahotsav",
                    "date": "September 2025",
                    "description": "An enchanting night of traditional Gujarati dance celebrating Navratri with music and dance.",
                    "image": "images/Garba mahotsav1.jpg",
                    "slideshowImages": [
                        "images/Garba mahotsav1.jpg",
                        "images/Garba mahotsav2.jpg",
                        "images/Garba mahotsav3.jpg",
                        "images/Garba mahotsav4.jpg",
                        "images/Garba mahotsav5.jpg",
                        "images/Garba mahotsav6.jpg",
                        "images/Garba mahotsav7.jpg",
                        "images/Garba mahotsav8.jpg",
                        "images/Garba mahotsav9.jpg",
                        "images/Garba mahotsav10.jpg",
                        "images/Garba mahotsav11.jpg",
                        "images/Garba mahotsav12.jpg",
                        "images/Garba mahotsav13.jpg",
                        "images/Garba mahotsav14.jpg",
                        "images/Garba mahotsav15.jpg"
                    ]
                },
                {
                    "id": 9,
                    "name": "Holi",
                    "date": "March 2025",
                    "description": "A vibrant celebration of colors bringing together families for an evening of joy and festivity.",
                    "image": "images/Holi1.jpg",
                    "slideshowImages": [
                        "images/Holi1.jpg",
                        "images/Holi2.jpg",
                        "images/Holi3.jpg",
                        "images/Holi4.jpg",
                        "images/Holi5.jpg",
                        "images/Holi6.jpg",
                        "images/Holi7.jpg",
                        "images/Holi8.jpg"
                    ]
                },
                {   
                    "id": 10,
                    "name": "Kabaddi",
                    "date": "",
                    "description": "Traditional Indian sport tournament featuring local teams.",
                    "image": "images/kabaddi1.jpg",
                    "slideshowImages": [
                        "images/kabaddi1.jpg",
                        "images/kabaddi2.jpg",
                        "images/kabaddi3.jpg",
                        "images/kabaddi4.jpg",
                        "images/kabaddi5.jpg",
                        "images/kabaddi6.jpg",
                        "images/kabaddi7.jpg"
                    ]
                },
                {
                    "id": 11,
                    "name": "Summer Camp for Basketball",
                    "date": "May 2025",
                    "description": "Training camp for young basketball enthusiasts to develop their skills under expert guidance.",
                    "image": "images/summer camp for basketball1.jpg",
                    "slideshowImages": [
                        "images/summer camp for basketball1.jpg",
                        "images/summer camp for basketball2.jpg",
                        "images/summer camp for basketball3.jpg",
                        "images/summer camp for basketball4.jpg",
                        "images/summer camp for basketball5.jpg"
                    ]
                }
            ],
            committeeMembers: [
                {
                    "id": 1,
                    "name": "Shri Vipul Agrawal",
                    "position": "President",
                    "image": "images/VIPUL AGRAWAL.jpg"
                },
                {
                    "id": 2,
                    "name": "Shri Prashant Pathak",
                    "position": "Vice President",
                    "image": "images/Prashant-Pathak.jpg"
                },
                {
                    "id": 3,
                    "name": "Shri Vedprakash Sharma",
                    "position": "General Secretary",
                    "image": "images/Shri Vedprakash Sharma.jpg"
                },
                {
                    "id": 4,
                    "name": "Shri Rakesh Kumar Shakya",
                    "position": "Joint Secretary",
                    "image": "images/Shri Rakesh Kumar Shakya.jpg"
                },
                {
                    "id": 5,
                    "name": "Yogesh Sarathe",
                    "position": "Cultural Secretary",
                    "image": "images/Yogesh Sarathe.jpg"
                },
                {
                    "id": 6,
                    "name": "Abhay Kumar Saxena",
                    "position": "Treasurer",
                    "image": "images/Abhay Kumar Saxena.jpg"
                },
                {
                    "id": 7,
                    "name": "Shri Anand Jaiswal",
                    "position": "Member",
                    "image": "images/Shri Anand Jaiswal.jpg"
                },
                {
                    "id": 8,
                    "name": "Shri Arun Sahu",
                    "position": "Member",
                    "image": "images/Shri Arun Sahu.jpg"
                },
                {
                    "id": 9,
                    "name": "Shri Birendra Singh",
                    "position": "Member",
                    "image": "images/Shri Birendra Singh.jpg"
                },
                {
                    "id": 10,
                    "name": "Shri C.K. Sharma",
                    "position": "Member",
                    "image": "images/Shri C.K. Sharma.jpg"
                },
                {
                    "id": 11,
                    "name": "Shri Jay Parihar",
                    "position": "Member",
                    "image": "images/Shri Jay Parihar.jpg"
                },
                {
                    "id": 12,
                    "name": "Shri Mahendra Thakre",
                    "position": "Member",
                    "image": "images/Shri Mahendra Thakre.jpg"
                },
                {
                    "id": 13,
                    "name": "Shri Nirmal Kumar Bowade",
                    "position": "Member",
                    "image": "images/Shri Nirmal Kumar Bovade.jpg"
                },
                {
                    "id": 14,
                    "name": "Shri Rajesh Barman",
                    "position": "Member",
                    "image": "images/Shri Rajesh Barman.jpg"
                },
                {
                    "id": 15,
                    "name": "Shri Ravi Yadav",
                    "position": "Member",
                    "image": "images/Shri Ravi Yadav.jpg"
                },
                {
                    "id": 16,
                    "name": "Shri Sandeep Lokhande",
                    "position": "Member",
                    "image": "images/Shri Sandeep Lokhande.jpg"
                },
                {
                    "id": 17,
                    "name": "Shri Sonu Kushwaha",
                    "position": "Member",
                    "image": "images/Shri Sonu Kushwaha.jpg"
                },
                {
                    "id": 18,
                    "name": "Shri Sunderlal",
                    "position": "Member",
                    "image": "images/Shri Sunderlal.jpg"
                },
                {
                    "id": 19,
                    "name": "Shri Upendra Prasad",
                    "position": "Member",
                    "image": "images/Shri Upendra Prasad.jpg"
                },
                {
                    "id": 20,
                    "name": "Shri Vimal Kumar Sahu",
                    "position": "Member",
                    "image": "images/Shri Vimal Kumar Sahu.jpg"
                },
                {
                    "id": 21,
                    "name": "Shri Vinay Savita",
                    "position": "Member",
                    "image": "images/Shri Vinay Savita.jpg"
                },
                {
                    "id": 22,
                    "name": "Shri Vinod Sahu",
                    "position": "Member",
                    "image": "images/Shri Vinod Sahu.jpg"
                }
            ],
            aboutContent: {
                "story": "Established in [year], AGA Club Bhel Bhopal has been a cornerstone of community life in the BHEL township. Named after the visionary leaders who founded our organization, we have grown from a small group of enthusiastic volunteers to a thriving community hub that brings together hundreds of families.",
                "mission": "Our mission is to foster a sense of community, celebrate our rich cultural heritage, and provide recreational and educational opportunities for all age groups. We believe in the power of togetherness and strive to create an environment where every member feels valued and connected.",
                "vision": "We envision a vibrant, inclusive community where traditions are preserved, new friendships are formed, and everyone has the opportunity to participate in meaningful activities. Our goal is to be a beacon of cultural and social excellence in BHEL Bhopal.",
                "joinUs": "If you share our passion for community building and cultural celebration, we invite you to become a member of AGA Club. Whether you want to volunteer, participate in events, or simply be part of our community, there's a place for you here. Contact us through our Contact Us page to learn more about membership opportunities.",
                "backgroundImage": "images/about-bg.jpg",
                "backgroundSlideshow": [
                    "images/about-bg.jpg",
                    "images/hero-bg.jpg",
                    "images/holi.jpg",
                    "images/garba.jpg",
                    "images/diwali.jpg"
                ]
            },
            contactContent: {
                "address": "716 D2 A SECTOR PIPLANI\nBEHIND GANDHI MARKET, PIPLANI, BHOPAL 462021",
                "phone": "0755 2503343",
                "email": "agaclubbhel@gmail.com",
                "hours": "Monday to Friday: 04:30 PM - 6:00 PM",
                "location": "Our club office is located in the central area of BHEL Township, easily accessible to all residents. Landmark: Near BHEL Community Center, Piplani, bhopal, Madhya Pradesh 462021",
                "backgroundImage": "images/contact-bg.jpg",
                "backgroundSlideshow": [
                    "images/contact-bg.jpg",
                    "images/basketball.jpg",
                    "images/hero-bg.jpg",
                    "images/holi.jpg",
                    "images/garba.jpg"
                ]
            },
            committeeContent: {
                "backgroundImage": "images/committee-bg.jpg",
                "backgroundSlideshow": [
                    "images/committee-bg.jpg",
                    "images/diwali.jpg",
                    "images/contact-bg.jpg",
                    "images/hero-bg.jpg",
                    "images/holi.jpg"
                ]
            },
            eventsContent: {
                "backgroundImage": "images/events-bg.jpg",
                "backgroundSlideshow": [
                    "images/events-bg.jpg",
                    "images/garba.jpg",
                    "images/diwali.jpg",
                    "images/basketball.jpg",
                    "images/hero-bg.jpg"
                ],
                "slideshowContainerSizeIncrease": "10%",
                "eventDirectories": [
                    { "dir": "images", "name": "Letter from Grandson Competition", "prefix": "letter from grandson competition" },
                    { "dir": "images", "name": "Plantation Program", "prefix": "plantation program" },
                    { "dir": "images", "name": "Memento Distribution", "prefix": "memento distribution" },
                    { "dir": "images", "name": "Independence Day", "prefix": "independence day" },
                    { "dir": "images", "name": "Committee Member Retirement Program", "prefix": "committee member retirement program" },
                    { "dir": "images", "name": "Cycle-Riding", "prefix": "cycle-riding" },
                    { "dir": "images", "name": "Diwali Milan", "prefix": "Diwali-milan" },
                    { "dir": "images", "name": "Garba Mahotsav", "prefix": "Garba mahotsav" },
                    { "dir": "images", "name": "Holi", "prefix": "Holi" },
                    { "dir": "images", "name": "Kabaddi", "prefix": "kabaddi" },
                    { "dir": "images", "name": "Summer Camp for Basketball", "prefix": "summer camp for basketball" }
                ]
            },
            upcomingContent: {
                "backgroundImage": "images/upcoming-bg.jpg",
                "backgroundSlideshow": [
                    "images/upcoming-bg.jpg",
                    "images/committee-bg.jpg",
                    "images/events-bg.jpg",
                    "images/contact-bg.jpg",
                    "images/about-bg.jpg"
                ]
            },
            membershipContent: {
                "backgroundImage": "images/membership-bg.jpg",
                "backgroundSlideshow": [
                    "images/membership-bg.jpg",
                    "images/committee-bg.jpg",
                    "images/events-bg.jpg",
                    "images/contact-bg.jpg",
                    "images/about-bg.jpg"
                ]
            }
        };
    }

    getDefaultDirectoryContent() {
        // Return content structure based on directory scanning
        // Note: This is a fallback method and should only include events that can be verified to exist
        return {
            registrationNumber: "01/01/01/40737/24",
            logo: "images/aga_club_logo.jpg",
            logo2: "images/logo-english.png",
            homepage: {
                header: {
                    title: "Welcome to AGA Club Bhel Bhopal",
                    subtitle: "Celebrating Community, Culture, and Togetherness",
                    backgroundImage: "images/hero-bg.jpg",
                    backgroundSlideshow: [
                        "images/hero-bg.jpg",
                        "images/holi.jpg",
                        "images/garba.jpg",
                        "images/diwali.jpg",
                        "images/basketball.jpg"
                    ]
                },
                leaders: [
                    {
                        "id": 1,
                        "name": "President",
                        "photo": "images/president.jpg",
                        "messageTitle": "President's Message",
                        "message": "आगा क्लब आनंद के साथ जीवन जीने का एक माध्यम है। इसके कार्यों के साथ जुड़कर मैं भी आनंदित महसूस कर रहा हूँ, आगा क्लब अपने सभी सदस्यों के साथ मिलकर तरक्की करे, ऐसी मेरी शुभकामनाएं हैं।",
                        "fullMessage": "आगा क्लब आनंद के साथ जीवन जीने का एक माध्यम है। इसके कार्यों के साथ जुड़कर मैं भी आनंदित महसूस कर रहा हूँ, आगा क्लब अपने सभी सदस्यों के साथ मिलकर तरक्की करे, ऐसी मेरी शुभकामनाएं हैं। - विपुल अग्रवाल"
                    },
                    {
                        "id": 2,
                        "name": "General Secretary",
                        "photo": "images/secretary.jpg",
                        "messageTitle": "General Secretary's Message",
                        "message": "यह क्लब केवल एक समूह नहीं, बल्कि प्रतिभा, रचनात्मकता और परंपराओं का एक जीवंत संगम है। हमारे क्लब का उद्देश्य अपने सदस्यों एवँ उनके परिजनों की कलात्मक प्रतिभाओं को पहचानना, उन्हें एक मंच प्रदान करना और विभिन्न खेलकूद गतिविधियों एवँ  सांस्कृतिक गतिविधियों जैसे प्रतियोगिताओं,उत्सव, प्रदर्शनियों और कार्यशालाओं के माध्यम से एकता और समझ को बढ़ावा देना है।",
                        "fullMessage": "यह क्लब केवल एक समूह नहीं, बल्कि प्रतिभा, रचनात्मकता और परंपराओं का एक जीवंत संगम है। हमारे क्लब का उद्देश्य अपने सदस्यों एवँ उनके परिजनों की कलात्मक प्रतिभाओं को पहचानना, उन्हें एक मंच प्रदान करना और विभिन्न खेलकूद गतिविधियों एवँ  सांस्कृतिक गतिविधियों जैसे प्रतियोगिताओं,उत्सव, प्रदर्शनियों और कार्यशालाओं के माध्यम से एकता और समझ को बढ़ावा देना है। मुझे विश्वास है कि आपके सहयोग से हम आने वाले वर्ष में कई नई ऊंचाइयों को छुएंगे। - वेद प्रकाश शर्मा"
                    }
                ],
                gallery: [
                    {
                        "id": 1,
                        "image": "images/holi.jpg",
                        "alt": "Holi Milan Samaroh"
                    },
                    {
                        "id": 2,
                        "image": "images/garba.jpg",
                        "alt": "Garba Mahotsav"
                    },
                    {
                        "id": 3,
                        "image": "images/diwali.jpg",
                        "alt": "Diwali Milan Samaroh"
                    },
                    {
                        "id": 4,
                        "image": "images/basketball.jpg",
                        "alt": "Basketball Tournament"
                    },
                    {
                        "id": 5,
                        "image": "images/sports-day.jpg",
                        "alt": "Annual Sports Day"
                    },
                    {
                        "id": 6,
                        "image": "images/children-compitition.jpg",
                        "alt": "Children's Competition"
                    },
                    {
                        "id": 7,
                        "image": "images/mothers-day.jpg",
                        "alt": "Mother's Day Celebration"
                    }
                ]
            },
            upcomingEvents: [
                {
                    "id": 1,
                    "name": "Navankur",
                    "date": "December 22, 2025",
                    "venue": "Club Ground",
                    "description": "Traditional tree planting ceremony to celebrate new beginnings and environmental consciousness.",
                    "formLink": "",
                    "image": "images/navankur.jpg"
                },
                {
                    "id": 2,
                    "name": "New Year Celebration",
                    "date": "January 1, 2026",
                    "venue": "Club Ground",
                    "description": "Ring in the new year with music, dance, and cultural performances. Refreshments will be served.",
                    "formLink": "",
                    "image": "images/new-year.jpg"
                },
                {
                    "id": 3,
                    "name": "Republic Day Celebration",
                    "date": "January 26, 2026",
                    "venue": "Main Hall",
                    "description": "Patriotic celebration featuring flag hoisting ceremony, cultural programs, and community lunch.",
                    "formLink": "",
                    "image": "images/republic-day.jpg"
                }
            ],
            pastEvents: [
                {
                    "id": 1,
                    "name": "Letter from Grandson Competition",
                    "date": "June 2025",
                    "description": "Creative letter writing competition encouraging grandchildren to express their thoughts and feelings to their grandparents.",
                    "image": "images/letter from grandson competition1.jpg",
                    "slideshowImages": [
                        "images/letter from grandson competition1.jpg",
                        "images/letter from grandson competition2.jpg",
                        "images/letter from grandson competition3.jpg",
                        "images/letter from grandson competition4.jpg",
                        "images/letter from grandson competition5.jpg",
                        "images/letter from grandson competition6.jpg",
                        "images/letter from grandson competition7.jpg",
                        "images/letter from grandson competition8.jpg"
                    ]
                },
                {
                    "id": 2,
                    "name": "Plantation Program",
                    "date": "July 2025",
                    "description": "Community initiative to plant trees and promote environmental awareness.",
                    "image": "images/plantation program1.jpg",
                    "slideshowImages": [
                        "images/plantation program1.jpg",
                        "images/plantation program2.jpg",
                        "images/plantation program3.jpg",
                        "images/plantation program4.jpg",
                        "images/plantation program5.jpg"
                    ]
                },
                {
                    "id": 3,
                    "name": "Memento Distribution",
                    "date": "April 2025",
                    "description": "Distribution of memorial items to honor the contributions of esteemed community members.",
                    "image": "images/memento distribution1.jpg",
                    "slideshowImages": [
                        "images/memento distribution1.jpg",
                        "images/memento distribution2.jpg",
                        "images/memento distribution3.jpg",
                        "images/memento distribution4.jpg",
                        "images/memento distribution5.jpg",
                        "images/memento distribution6.jpg",
                        "images/memento distribution7.jpg",
                        "images/memento distribution8.jpg",
                        "images/memento distribution9.jpg",
                        "images/memento distribution10.jpg",
                        "images/memento distribution11.jpg",
                        "images/memento distribution12.jpg"
                    ]
                },
                {
                    "id": 4,
                    "name": "Independence Day",
                    "date": "August 2025",
                    "description": "Patriotic celebration of India's independence with flag hoisting and cultural programs.",
                    "image": "images/independence day1.jpg",
                    "slideshowImages": [
                        "images/independence day1.jpg",
                        "images/independence day2.jpg",
                        "images/independence day3.jpg",
                        "images/independence day4.jpg"
                    ]
                },
                {
                    "id": 5,
                    "name": "Committee Member Retirement Program",
                    "date": "December 2025",
                    "description": "Honoring our dedicated committee members for their years of service to the community.",
                    "image": "images/committee member retirement program1.jpg",
                    "slideshowImages": [
                        "images/committee member retirement program1.jpg",
                        "images/committee member retirement program2.jpg",
                        "images/committee member retirement program3.jpg",
                        "images/committee member retirement program4.jpg",
                        "images/committee member retirement program5.jpg",
                        "images/committee member retirement program6.jpg",
                        "images/committee member retirement program7.jpg"
                    ]
                },
                {
                    "id": 6,
                    "name": "Cycle-Riding",
                    "date": "",
                    "description": "Community cycling event promoting health and environmental awareness.",
                    "image": "images/cycle-riding1.jpg",
                    "slideshowImages": [
                        "images/cycle-riding1.jpg",
                        "images/cycle-riding2.jpg",
                        "images/cycle-riding3.jpg",
                        "images/cycle-riding4.jpg"
                    ]
                },
                {
                    "id": 7,
                    "name": "Diwali Milan",
                    "date": "October 2025",
                    "description": "The festival of lights celebrated with decorations, sweets, and cultural performances.",
                    "image": "images/Diwali-milan1.jpg",
                    "slideshowImages": [
                        "images/Diwali-milan1.jpg",
                        "images/Diwali-milan2.jpg",
                        "images/Diwali-milan3.jpg",
                        "images/Diwali-milan4.jpg",
                        "images/Diwali-milan5.jpg",
                        "images/Diwali-milan6.jpg",
                        "images/Diwali-milan7.jpg",
                        "images/Diwali-milan8.jpg",
                        "images/Diwali-milan9.jpg",
                        "images/Diwali-milan10.jpg",
                        "images/Diwali-milan11.jpg"
                    ]
                },
                {
                    "id": 8,
                    "name": "Garba Mahotsav",
                    "date": "September 2025",
                    "description": "An enchanting night of traditional Gujarati dance celebrating Navratri with music and dance.",
                    "image": "images/Garba mahotsav1.jpg",
                    "slideshowImages": [
                        "images/Garba mahotsav1.jpg",
                        "images/Garba mahotsav2.jpg",
                        "images/Garba mahotsav3.jpg",
                        "images/Garba mahotsav4.jpg",
                        "images/Garba mahotsav5.jpg",
                        "images/Garba mahotsav6.jpg",
                        "images/Garba mahotsav7.jpg",
                        "images/Garba mahotsav8.jpg",
                        "images/Garba mahotsav9.jpg",
                        "images/Garba mahotsav10.jpg",
                        "images/Garba mahotsav11.jpg",
                        "images/Garba mahotsav12.jpg",
                        "images/Garba mahotsav13.jpg",
                        "images/Garba mahotsav14.jpg",
                        "images/Garba mahotsav15.jpg"
                    ]
                },
                {
                    "id": 9,
                    "name": "Holi",
                    "date": "March 2025",
                    "description": "A vibrant celebration of colors bringing together families for an evening of joy and festivity.",
                    "image": "images/Holi1.jpg",
                    "slideshowImages": [
                        "images/Holi1.jpg",
                        "images/Holi2.jpg",
                        "images/Holi3.jpg",
                        "images/Holi4.jpg",
                        "images/Holi5.jpg",
                        "images/Holi6.jpg",
                        "images/Holi7.jpg",
                        "images/Holi8.jpg"
                    ]
                },
                {
                    "id": 10,
                    "name": "Kabaddi",
                    "date": "",
                    "description": "Traditional Indian sport tournament featuring local teams.",
                    "image": "images/kabaddi1.jpg",
                    "slideshowImages": [
                        "images/kabaddi1.jpg",
                        "images/kabaddi2.jpg",
                        "images/kabaddi3.jpg",
                        "images/kabaddi4.jpg",
                        "images/kabaddi5.jpg",
                        "images/kabaddi6.jpg",
                        "images/kabaddi7.jpg"
                    ]
                },
                {
                    "id": 11,
                    "name": "Summer Camp for Basketball",
                    "date": "May 2025",
                    "description": "Training camp for young basketball enthusiasts to develop their skills under expert guidance.",
                    "image": "images/summer camp for basketball1.jpg",
                    "slideshowImages": [
                        "images/summer camp for basketball1.jpg",
                        "images/summer camp for basketball2.jpg",
                        "images/summer camp for basketball3.jpg",
                        "images/summer camp for basketball4.jpg",
                        "images/summer camp for basketball5.jpg"
                    ]
                }
            ],
            committeeMembers: [
                {
                    "id": 1,
                    "name": "Shri Vipul Agrawal",
                    "position": "President",
                    "image": "images/VIPUL AGRAWAL.jpg"
                },
                {
                    "id": 2,
                    "name": "Shri Prashant Pathak",
                    "position": "Vice President",
                    "image": "images/Prashant-Pathak.jpg"
                },
                {
                    "id": 3,
                    "name": "Shri Vedprakash Sharma",
                    "position": "General Secretary",
                    "image": "images/Shri Vedprakash Sharma.jpg"
                },
                {
                    "id": 4,
                    "name": "Shri Rakesh Kumar Shakya",
                    "position": "Joint Secretary",
                    "image": "images/Shri Rakesh Kumar Shakya.jpg"
                },
                {
                    "id": 5,
                    "name": "Yogesh Sarathe",
                    "position": "Cultural Secretary",
                    "image": "images/Yogesh Sarathe.jpg"
                },
                {
                    "id": 6,
                    "name": "Abhay Kumar Saxena",
                    "position": "Treasurer",
                    "image": "images/Abhay Kumar Saxena.jpg"
                },
                {
                    "id": 7,
                    "name": "Shri Anand Jaiswal",
                    "position": "Member",
                    "image": "images/Shri Anand Jaiswal.jpg"
                },
                {
                    "id": 8,
                    "name": "Shri Arun Sahu",
                    "position": "Member",
                    "image": "images/Shri Arun Sahu.jpg"
                },
                {
                    "id": 9,
                    "name": "Shri Birendra Singh",
                    "position": "Member",
                    "image": "images/Shri Birendra Singh.jpg"
                },
                {
                    "id": 10,
                    "name": "Shri C.K. Sharma",
                    "position": "Member",
                    "image": "images/Shri C.K. Sharma.jpg"
                },
                {
                    "id": 11,
                    "name": "Shri Jay Parihar",
                    "position": "Member",
                    "image": "images/Shri Jay Parihar.jpg"
                },
                {
                    "id": 12,
                    "name": "Shri Mahendra Thakre",
                    "position": "Member",
                    "image": "images/Shri Mahendra Thakre.jpg"
                },
                {
                    "id": 13,
                    "name": "Shri Nirmal Kumar Bowade",
                    "position": "Member",
                    "image": "images/Shri Nirmal Kumar Bovade.jpg"
                },
                {
                    "id": 14,
                    "name": "Shri Rajesh Barman",
                    "position": "Member",
                    "image": "images/Shri Rajesh Barman.jpg"
                },
                {
                    "id": 15,
                    "name": "Shri Ravi Yadav",
                    "position": "Member",
                    "image": "images/Shri Ravi Yadav.jpg"
                },
                {
                    "id": 16,
                    "name": "Shri Sandeep Lokhande",
                    "position": "Member",
                    "image": "images/Shri Sandeep Lokhande.jpg"
                },
                {
                    "id": 17,
                    "name": "Shri Sonu Kushwaha",
                    "position": "Member",
                    "image": "images/Shri Sonu Kushwaha.jpg"
                },
                {
                    "id": 18,
                    "name": "Shri Sunderlal",
                    "position": "Member",
                    "image": "images/Shri Sunderlal.jpg"
                },
                {
                    "id": 19,
                    "name": "Shri Upendra Prasad",
                    "position": "Member",
                    "image": "images/Shri Upendra Prasad.jpg"
                },
                {
                    "id": 20,
                    "name": "Shri Vimal Kumar Sahu",
                    "position": "Member",
                    "image": "images/Shri Vimal Kumar Sahu.jpg"
                },
                {
                    "id": 21,
                    "name": "Shri Vinay Savita",
                    "position": "Member",
                    "image": "images/Shri Vinay Savita.jpg"
                },
                {
                    "id": 22,
                    "name": "Shri Vinod Sahu",
                    "position": "Member",
                    "image": "images/Shri Vinod Sahu.jpg"
                }
            ],
            aboutContent: {
                "story": "Established in [year], AGA Club Bhel Bhopal has been a cornerstone of community life in the BHEL township. Named after the visionary leaders who founded our organization, we have grown from a small group of enthusiastic volunteers to a thriving community hub that brings together hundreds of families.",
                "mission": "Our mission is to foster a sense of community, celebrate our rich cultural heritage, and provide recreational and educational opportunities for all age groups. We believe in the power of togetherness and strive to create an environment where every member feels valued and connected.",
                "vision": "We envision a vibrant, inclusive community where traditions are preserved, new friendships are formed, and everyone has the opportunity to participate in meaningful activities. Our goal is to be a beacon of cultural and social excellence in BHEL Bhopal.",
                "joinUs": "If you share our passion for community building and cultural celebration, we invite you to become a member of AGA Club. Whether you want to volunteer, participate in events, or simply be part of our community, there's a place for you here. Contact us through our Contact Us page to learn more about membership opportunities.",
                "backgroundImage": "images/about-bg.jpg",
                "backgroundSlideshow": [
                    "images/about-bg.jpg",
                    "images/hero-bg.jpg",
                    "images/holi.jpg",
                    "images/garba.jpg",
                    "images/diwali.jpg"
                ]
            },
            contactContent: {
                "address": "716 D2 A SECTOR PIPLANI\nBEHIND GANDHI MARKET, PIPLANI, BHOPAL 462021",
                "phone": "0755 2503343",
                "email": "agaclubbhel@gmail.com",
                "hours": "Monday to Friday: 04:30 PM - 6:00 PM",
                "location": "Our club office is located in the central area of BHEL Township, easily accessible to all residents. Landmark: Near BHEL Community Center, Piplani, bhopal, Madhya Pradesh 462021",
                "backgroundImage": "images/contact-bg.jpg",
                "backgroundSlideshow": [
                    "images/contact-bg.jpg",
                    "images/basketball.jpg",
                    "images/hero-bg.jpg",
                    "images/holi.jpg",
                    "images/garba.jpg"
                ]
            },
            committeeContent: {
                "backgroundImage": "images/committee-bg.jpg",
                "backgroundSlideshow": [
                    "images/committee-bg.jpg",
                    "images/diwali.jpg",
                    "images/contact-bg.jpg",
                    "images/hero-bg.jpg",
                    "images/holi.jpg"
                ]
            },
            eventsContent: {
                "backgroundImage": "images/events-bg.jpg",
                "backgroundSlideshow": [
                    "images/events-bg.jpg",
                    "images/garba.jpg",
                    "images/diwali.jpg",
                    "images/basketball.jpg",
                    "images/hero-bg.jpg"
                ],
                "slideshowContainerSizeIncrease": "10%",
                "eventDirectories": [
                    { "dir": "images", "name": "Letter from Grandson Competition", "prefix": "letter from grandson competition" },
                    { "dir": "images", "name": "Plantation Program", "prefix": "plantation program" },
                    { "dir": "images", "name": "Memento Distribution", "prefix": "memento distribution" },
                    { "dir": "images", "name": "Independence Day", "prefix": "independence day" },
                    { "dir": "images", "name": "Committee Member Retirement Program", "prefix": "committee member retirement program" },
                    { "dir": "images", "name": "Cycle-Riding", "prefix": "cycle-riding" },
                    { "dir": "images", "name": "Diwali Milan", "prefix": "Diwali-milan" },
                    { "dir": "images", "name": "Garba Mahotsav", "prefix": "Garba mahotsav" },
                    { "dir": "images", "name": "Holi", "prefix": "Holi" },
                    { "dir": "images", "name": "Kabaddi", "prefix": "kabaddi" },
                    { "dir": "images", "name": "Summer Camp for Basketball", "prefix": "summer camp for basketball" }
                ]
            },
            upcomingContent: {
                "backgroundImage": "images/upcoming-bg.jpg",
                "backgroundSlideshow": [
                    "images/upcoming-bg.jpg",
                    "images/committee-bg.jpg",
                    "images/events-bg.jpg",
                    "images/contact-bg.jpg",
                    "images/about-bg.jpg"
                ]
            },
            membershipContent: {
                "backgroundImage": "images/membership-bg.jpg",
                "backgroundSlideshow": [
                    "images/membership-bg.jpg",
                    "images/committee-bg.jpg",
                    "images/events-bg.jpg",
                    "images/contact-bg.jpg",
                    "images/about-bg.jpg"
                ]
            }
        };
    }

    // Helper function to parse date strings
    parseDate(dateString) {
        // Handle different date formats
        if (dateString.includes('TBD')) {
            return null; // Undefined date
        }
        
        // Try to parse the date string
        // Handle formats like "December 22, 2025" or "June 2025"
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        
        // Match "Month Day, Year" format
        const fullDateMatch = dateString.match(/(\w+)\s+(\d+),\s*(\d+)/);
        if (fullDateMatch) {
            const [, month, day, year] = fullDateMatch;
            return new Date(parseInt(year), months[month], parseInt(day));
        }
        
        // Match "Month Year" format
        const monthYearMatch = dateString.match(/(\w+)\s+(\d+)/);
        if (monthYearMatch) {
            const [, month, year] = monthYearMatch;
            return new Date(parseInt(year), months[month], 1);
        }
        
        // Try standard date parsing as fallback
        const parsed = new Date(dateString);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Function to automatically migrate events based on date
    async migrateEventsAutomatically() {
        const content = await this.loadContent();
        const now = new Date();
        
        // Check if we need to migrate any upcoming events
        const upcomingEventsArray = content.upcomingEvents ? Object.values(content.upcomingEvents) : [];
        if (upcomingEventsArray.length > 0) {
            const stillUpcoming = {};
            const newlyPast = [];
            let upcomingIndex = 0;
            
            for (const [key, event] of Object.entries(content.upcomingEvents)) {
                const eventDate = this.parseDate(event.date);
                
                // If event date is valid and in the past, move to past events
                if (eventDate && eventDate < now) {
                    // Add to past events (without formLink and venue)
                    const pastEventsCount = content.pastEvents ? Object.keys(content.pastEvents).length : 0;
                    const pastEvent = {
                        id: pastEventsCount + newlyPast.length + 1,
                        name: event.name,
                        date: event.date,
                        description: event.description,
                        image: event.image,
                        // For slideshow images, we'll need to generate them or leave empty initially
                        slideshowImages: []
                    };
                    newlyPast.push(pastEvent);
                } else {
                    // Still upcoming
                    stillUpcoming[upcomingIndex++] = event;
                }
            }
            
            // If we moved any events, update the content
            if (newlyPast.length > 0) {
                // Update upcoming events
                content.upcomingEvents = stillUpcoming;
                
                // Add newly past events to the beginning of past events
                const updatedPastEvents = {};
                // Add newly past events first
                newlyPast.forEach((event, index) => {
                    updatedPastEvents[index] = event;
                });
                // Then add existing past events
                if (content.pastEvents) {
                    const existingPastEvents = Object.values(content.pastEvents);
                    existingPastEvents.forEach((event, index) => {
                        updatedPastEvents[newlyPast.length + index] = event;
                    });
                }
                content.pastEvents = updatedPastEvents;
                
                // Update cache
                this.cache = content;
                
                console.log(`Migrated ${newlyPast.length} events from upcoming to past`);
                return true;
            }
        }
        
        return false;
    }

    // Enhanced getUpcomingEvents that checks for automatic migration
    async getUpcomingEvents() {
        const content = await this.loadContent();
        return content.upcomingEvents ? Object.values(content.upcomingEvents) : [];
    }

    async getPastEvents() {
        const content = await this.loadContent();
        return content.pastEvents ? Object.values(content.pastEvents) : [];
    }

    async getCommitteeMembers() {
        const content = await this.loadContent();
        return content.committeeMembers || [];
    }

    async getAboutContent() {
        const content = await this.loadContent();
        return content.aboutContent || {};
    }

    async getContactContent() {
        const content = await this.loadContent();
        return content.contactContent || {};
    }
    
    async getMembershipContent() {
        const content = await this.loadContent();
        return content.membershipContent || {};
    }
    
    // Load membership data from Google Sheet
    async getMembershipData() {
        console.log('Loading membership data - prioritizing editable content.json members');
        
        try {
            const content = await this.loadContent();
            if (Array.isArray(content.members) && content.members.length > 0) {
                console.log('Successfully loaded from content.json:', content.members.length, 'members');
                return content.members;
            }
        } catch (contentError) {
            console.warn('content.json members failed:', contentError.message);
        }
        
        // Try local members.json first
        try {
            console.log('Trying to load from local members.json...');
            const response = await fetch('members.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const members = await response.json();
            const memberList = Array.isArray(members) ? members : members.members;
            if (!Array.isArray(memberList)) {
                throw new Error('members.json does not contain a member list');
            }
            console.log('Successfully loaded from local members.json:', memberList.length, 'members');
            if (memberList.length > 0) {
                console.log('First member from JSON:', memberList[0]);
            }
            return memberList;
        } catch (localError) {
            console.warn('Local members.json failed:', localError.message);
            console.log('Falling back to Google Sheets...');
        }
        
        // Fallback to Google Sheets
        try {
            console.log('Loading membership data from Google Sheet');
            console.log('Sheet ID:', MEMBERSHIP_SHEET_ID);
            console.log('Sheet GID:', MEMBERSHIP_SHEET_GID);
            
            // Construct the Google Sheet CSV export URL
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${MEMBERSHIP_SHEET_ID}/export?format=csv&gid=${MEMBERSHIP_SHEET_GID}`;
            
            console.log('Fetching from URL:', sheetUrl);
            
            // Try to fetch the CSV data
            const response = await fetch(sheetUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const csvText = await response.text();
            console.log('CSV data received, length:', csvText.length);
            console.log('First 200 chars of CSV:', csvText.substring(0, 200));
            
            // Parse CSV data
            const lines = csvText.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                throw new Error('No data found in sheet. Only header or empty sheet.');
            }
            
            // Parse header row
            const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
            console.log('Headers found:', headers);
            
            // Check if required columns exist
            const requiredColumns = ['Name', 'Staff No.', 'Contact No.', 'Department'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
                console.warn('Missing columns:', missingColumns);
                console.warn('Available columns:', headers);
            }
            
            // Parse data rows
            const members = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
                const member = {};
                
                headers.forEach((header, index) => {
                    member[header] = values[index] || '';
                });
                
                members.push(member);
            }
            
            console.log('Parsed members from Google Sheets:', members.length);
            if (members.length > 0) {
                console.log('First member from Google Sheets:', members[0]);
            }
            
            return members;
            
        } catch (googleError) {
            console.error('❌ Both local members.json and Google Sheets failed');
            console.error('Google Sheets error:', googleError.message);
            // Return empty array instead of throwing error
            return [];
        }
    }
    
    async getEventDirectories() {
        const content = await this.loadContent();
        if (content.eventsContent && content.eventsContent.eventDirectories) {
            return content.eventsContent.eventDirectories;
        }
        return [];
    }
    
    // Sync membership data from Google Sheet to content.json
    async syncMembershipData() {
        try {
            console.log('Starting membership data sync...');
            
            // Load current content
            const content = await this.loadContent();
            
            // Get membership data from Google Sheet
            const members = await this.getMembershipData();
            
            if (members.length === 0) {
                console.warn('No membership data available for sync');
                return false;
            }
            
            // Add membership data to content
            content.membershipData = {
                lastSync: new Date().toISOString(),
                memberCount: members.length,
                members: members
            };
            
            console.log(`Syncing ${members.length} members to content.json`);
            
            // In a real server environment, you would send this to a server endpoint
            // For now, we'll just update the local content cache
            this.cache = content;
            
            // Try to save to a local file (this won't work in browser due to security restrictions)
            // This is just for demonstration - in practice, you'd need a server endpoint
            try {
                const jsonString = JSON.stringify(content, null, 2);
                console.log('Content updated in cache (server sync would be needed for permanent save)');
                return true;
            } catch (saveError) {
                console.warn('Could not save to file (browser security restriction):', saveError);
                return true; // Still return true as cache was updated
            }
            
        } catch (error) {
            console.error('Error syncing membership data:', error);
            return false;
        }
    }


}

// Create a global instance
const contentLoader = new ContentLoader();
