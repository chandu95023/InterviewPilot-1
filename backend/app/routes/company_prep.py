from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..auth import get_current_user
from ..postgres_db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Float, JSON, DateTime
from ..postgres_db import Base
from ..services.ai_service import generate_company_questions, evaluate_answer
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# ──────────────────────────────────────────────
# Company Database
# ──────────────────────────────────────────────
COMPANY_DB = {
    "Google": {
        "tier": "FAANG", "emoji": "🔍",
        "difficulty": "Very Hard", "selection_rate": "0.2%",
        "avg_rounds": 6, "avg_duration": "4-8 weeks",
        "salary_range": "$150k - $400k",
        "culture": "Data-driven, Innovation-first, Open culture",
        "focus_areas": ["DSA", "System Design", "Behavioral", "Leadership"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "90 min", "difficulty": "Medium", "weightage": "15%", "elimination": "60%", "description": "Coding problems on competitive platform, 2-3 DSA questions"},
            {"round": 2, "name": "Phone Screen", "duration": "45 min", "difficulty": "Medium-Hard", "weightage": "15%", "elimination": "40%", "description": "Data structures, algorithms, 1-2 coding problems with interviewer"},
            {"round": 3, "name": "Technical Interview 1", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "30%", "description": "Advanced algorithms, graph problems, dynamic programming"},
            {"round": 4, "name": "Technical Interview 2", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "25%", "description": "System design, scalability, distributed systems"},
            {"round": 5, "name": "Behavioral Interview", "duration": "45 min", "difficulty": "Medium", "weightage": "15%", "elimination": "20%", "description": "Google values, leadership principles, past experiences"},
            {"round": 6, "name": "Hiring Committee Review", "duration": "N/A", "difficulty": "N/A", "weightage": "15%", "elimination": "30%", "description": "Committee reviews all feedback, final decision"},
        ],
        "preparation_strategy": "Focus heavily on LeetCode Hard problems, practice system design for large scale systems, study Google's 10X thinking and leadership principles.",
        "recent_topics": ["Distributed systems", "Machine learning concepts", "Graph algorithms", "API design", "Kubernetes"],
        "resources": {
            "youtube": ["TechLead - Google interview", "NeetCode.io", "Abdul Bari DSA"],
            "platforms": ["LeetCode", "Codeforces", "Google Kick Start"],
            "articles": ["Google SWE Interview Guide", "Cracking the Coding Interview"],
        }
    },
    "Amazon": {
        "tier": "FAANG", "emoji": "📦",
        "difficulty": "Hard", "selection_rate": "1.5%",
        "avg_rounds": 5, "avg_duration": "2-4 weeks",
        "salary_range": "$140k - $350k",
        "culture": "Customer obsession, Ownership, Day 1 mentality",
        "focus_areas": ["DSA", "System Design", "Leadership Principles", "Behavioral"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "105 min", "difficulty": "Medium", "weightage": "10%", "elimination": "50%", "description": "2 coding questions + work simulation"},
            {"round": 2, "name": "Technical Phone Screen", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "20%", "elimination": "40%", "description": "DSA + 2-3 leadership principle questions"},
            {"round": 3, "name": "Loop Interview 1", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "35%", "description": "Coding + leadership principles (STAR method)"},
            {"round": 4, "name": "Loop Interview 2", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "30%", "description": "System design + leadership principles"},
            {"round": 5, "name": "Bar Raiser", "duration": "60 min", "difficulty": "Very Hard", "weightage": "30%", "elimination": "40%", "description": "All-around assessment by senior employee focused on Amazon culture"},
        ],
        "preparation_strategy": "Master Amazon's 16 Leadership Principles using STAR method. Practice medium-hard LeetCode with emphasis on arrays, trees, and dynamic programming.",
        "recent_topics": ["Leadership principles", "Distributed systems", "Microservices", "AWS services", "Behavioral scenarios"],
        "resources": {
            "youtube": ["Amazon SDE Interview Prep", "Tech Dummies"],
            "platforms": ["LeetCode", "HackerRank Amazon", "AWS Practice Exams"],
            "articles": ["Amazon LP Guide", "System Design Interview"],
        }
    },
    "Microsoft": {
        "tier": "FAANG", "emoji": "🪟",
        "difficulty": "Hard", "selection_rate": "1.8%",
        "avg_rounds": 5, "avg_duration": "2-3 weeks",
        "salary_range": "$130k - $300k",
        "culture": "Growth mindset, Inclusive, Collaboration",
        "focus_areas": ["DSA", "System Design", "Problem Solving", "Behavioral"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "75 min", "difficulty": "Medium", "weightage": "10%", "elimination": "50%", "description": "Coding assessment + cognitive tests"},
            {"round": 2, "name": "Recruiter Screen", "duration": "30 min", "difficulty": "Easy", "weightage": "5%", "elimination": "20%", "description": "Background, motivation, and culture fit"},
            {"round": 3, "name": "Technical Interview 1", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "25%", "elimination": "40%", "description": "DSA, coding problems, software design"},
            {"round": 4, "name": "Technical Interview 2", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "System design, object-oriented design"},
            {"round": 5, "name": "As-Appropriate Interview", "duration": "60 min", "difficulty": "Hard", "weightage": "35%", "elimination": "30%", "description": "Senior interview reviewing all feedback, final culture and technical assessment"},
        ],
        "preparation_strategy": "Focus on growth mindset examples, practice OOP design patterns, study distributed systems. Microsoft values collaboration and learning.",
        "recent_topics": ["Azure services", "OOP design patterns", "REST API design", "Microservices", "DevOps"],
        "resources": {
            "youtube": ["Microsoft SWE Prep", "Nick White LeetCode"],
            "platforms": ["LeetCode", "Microsoft Learn", "HackerRank"],
            "articles": ["Microsoft Interview Guide", "Azure Architecture Center"],
        }
    },
    "Meta": {
        "tier": "FAANG", "emoji": "👤",
        "difficulty": "Very Hard", "selection_rate": "0.5%",
        "avg_rounds": 5, "avg_duration": "3-6 weeks",
        "salary_range": "$160k - $450k",
        "culture": "Move fast, Be direct, Build social value",
        "focus_areas": ["DSA", "System Design", "Product Sense", "Behavioral"],
        "interview_rounds": [
            {"round": 1, "name": "Initial Screen", "duration": "45 min", "difficulty": "Medium", "weightage": "15%", "elimination": "50%", "description": "2 coding problems on shared editor with recruiter/engineer"},
            {"round": 2, "name": "Technical Interview", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "Coding + problem decomposition, edge cases"},
            {"round": 3, "name": "System Design", "duration": "60 min", "difficulty": "Very Hard", "weightage": "25%", "elimination": "35%", "description": "Design scalable systems like Instagram feed, WhatsApp"},
            {"round": 4, "name": "Behavioral Interview", "duration": "45 min", "difficulty": "Medium", "weightage": "20%", "elimination": "25%", "description": "Past experiences, conflict resolution, Meta values"},
            {"round": 5, "name": "Hiring Manager Review", "duration": "30 min", "difficulty": "Medium", "weightage": "15%", "elimination": "20%", "description": "Final review with HM, team fit discussion"},
        ],
        "preparation_strategy": "Practice graph algorithms heavily. Study system design for social media at scale. Prepare product intuition for Facebook/Instagram/WhatsApp scenarios.",
        "recent_topics": ["Graph algorithms", "Social network design", "News feed algorithm", "Distributed databases", "React internals"],
        "resources": {
            "youtube": ["Meta SWE Interview", "Gaurav Sen System Design"],
            "platforms": ["LeetCode", "Pramp", "Interviewing.io"],
            "articles": ["Meta Engineering Blog", "System Design Primer"],
        }
    },
    "Apple": {
        "tier": "FAANG", "emoji": "🍎",
        "difficulty": "Very Hard", "selection_rate": "0.4%",
        "avg_rounds": 6, "avg_duration": "4-8 weeks",
        "salary_range": "$150k - $400k",
        "culture": "Excellence, Secrecy, Craft, Innovation",
        "focus_areas": ["DSA", "System Design", "Domain Expertise", "Culture Fit"],
        "interview_rounds": [
            {"round": 1, "name": "Recruiter Screen", "duration": "30 min", "difficulty": "Easy", "weightage": "5%", "elimination": "30%", "description": "Background check, motivation, salary expectations"},
            {"round": 2, "name": "Technical Phone Screen", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "20%", "elimination": "40%", "description": "Coding + project deep dive"},
            {"round": 3, "name": "Domain Interview 1", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "35%", "description": "Deep domain expertise (iOS, ML, Platform, etc.)"},
            {"round": 4, "name": "Domain Interview 2", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "30%", "description": "System design for Apple-specific products"},
            {"round": 5, "name": "Behavioral Panel", "duration": "60 min", "difficulty": "Medium", "weightage": "15%", "elimination": "25%", "description": "Multiple interviewers, Apple values focus"},
            {"round": 6, "name": "Senior Leadership Review", "duration": "45 min", "difficulty": "Hard", "weightage": "20%", "elimination": "30%", "description": "Final assessment by director/VP level"},
        ],
        "preparation_strategy": "Study Apple's product design philosophy. Prepare domain-specific expertise (iOS, macOS, ML). Emphasize quality, attention to detail, and user experience.",
        "recent_topics": ["iOS development", "Swift", "Core ML", "Hardware-software integration", "Privacy"],
        "resources": {
            "youtube": ["Apple Developer WWDC", "Stanford iOS Course"],
            "platforms": ["LeetCode", "Apple Developer", "Coursera"],
            "articles": ["Apple HIG", "Apple Developer Documentation"],
        }
    },
    "Netflix": {
        "tier": "FAANG", "emoji": "🎬",
        "difficulty": "Hard", "selection_rate": "1%",
        "avg_rounds": 5, "avg_duration": "3-4 weeks",
        "salary_range": "$200k - $500k (top of market)",
        "culture": "Freedom & Responsibility, High performance, Radical transparency",
        "focus_areas": ["System Design", "Culture Fit", "DSA", "Senior expertise"],
        "interview_rounds": [
            {"round": 1, "name": "Recruiter Screen", "duration": "30 min", "difficulty": "Easy", "weightage": "5%", "elimination": "40%", "description": "Culture fit for Netflix's unique model, high expectations upfront"},
            {"round": 2, "name": "Technical Screen", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "20%", "elimination": "35%", "description": "Strong coding skills, problem-solving approach"},
            {"round": 3, "name": "Technical Deep Dive", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "System architecture, distributed systems at Netflix scale"},
            {"round": 4, "name": "Culture Interview", "duration": "60 min", "difficulty": "Medium", "weightage": "30%", "elimination": "40%", "description": "Netflix culture deck, freedom and responsibility, radical transparency"},
            {"round": 5, "name": "Senior Panel Review", "duration": "60 min", "difficulty": "Hard", "weightage": "20%", "elimination": "25%", "description": "Senior engineers assess breadth + depth of expertise"},
        ],
        "preparation_strategy": "Study Netflix's culture deck thoroughly. Prepare for high-level system design (streaming, recommendations). Emphasize ownership and senior-level thinking.",
        "recent_topics": ["Video streaming", "Recommendation systems", "Microservices", "Chaos engineering", "CDN"],
        "resources": {
            "youtube": ["Netflix Tech Blog talks", "Distributed systems lectures"],
            "platforms": ["LeetCode", "Educative.io"],
            "articles": ["Netflix Tech Blog", "Netflix OSS"],
        }
    },
    "Flipkart": {
        "tier": "Indian Product", "emoji": "🛒",
        "difficulty": "Hard", "selection_rate": "2%",
        "avg_rounds": 5, "avg_duration": "2-3 weeks",
        "salary_range": "₹25L - ₹80L",
        "culture": "Customer first, Speed, Scale",
        "focus_areas": ["DSA", "System Design", "Java/Python", "Behavioral"],
        "interview_rounds": [
            {"round": 1, "name": "Online Coding Test", "duration": "90 min", "difficulty": "Medium", "weightage": "15%", "elimination": "55%", "description": "3 coding problems on HackerEarth/custom platform"},
            {"round": 2, "name": "Technical Round 1", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "25%", "elimination": "40%", "description": "DSA, coding with optimal solutions, time complexity"},
            {"round": 3, "name": "Technical Round 2", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "System design for e-commerce scale, Java/Spring Boot"},
            {"round": 4, "name": "Hiring Manager", "duration": "45 min", "difficulty": "Medium", "weightage": "20%", "elimination": "25%", "description": "Technical depth + behavioral, team expectations"},
            {"round": 5, "name": "HR Interview", "duration": "30 min", "difficulty": "Easy", "weightage": "15%", "elimination": "15%", "description": "Culture fit, compensation, joining timeline"},
        ],
        "preparation_strategy": "Focus on e-commerce system design (inventory, search, checkout, payment). Practice Java or Python with OOP concepts. Study Flipkart's tech stack.",
        "recent_topics": ["Distributed systems", "Search algorithms", "Payment gateways", "Recommendation engines", "Kafka"],
        "resources": {
            "youtube": ["Flipkart Engineering channel", "DSA with Java"],
            "platforms": ["LeetCode", "HackerEarth", "GeeksForGeeks"],
            "articles": ["Flipkart Tech Blog"],
        }
    },
    "Swiggy": {
        "tier": "Indian Product", "emoji": "🍕",
        "difficulty": "Medium-Hard", "selection_rate": "3%",
        "avg_rounds": 4, "avg_duration": "2-3 weeks",
        "salary_range": "₹20L - ₹60L",
        "culture": "Hunger, Hustle, Speed, Customer delight",
        "focus_areas": ["DSA", "Backend Systems", "Microservices", "System Design"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "60 min", "difficulty": "Medium", "weightage": "15%", "elimination": "50%", "description": "2-3 DSA problems, emphasis on optimization"},
            {"round": 2, "name": "Technical Round", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "30%", "elimination": "40%", "description": "Backend systems, APIs, database design"},
            {"round": 3, "name": "System Design", "duration": "45 min", "difficulty": "Hard", "weightage": "30%", "elimination": "35%", "description": "Design food delivery systems at Swiggy scale"},
            {"round": 4, "name": "Managerial + HR", "duration": "45 min", "difficulty": "Medium", "weightage": "25%", "elimination": "20%", "description": "Leadership, culture fit, career goals"},
        ],
        "preparation_strategy": "Study real-time systems (location tracking, live order updates). Practice microservices design. Focus on Go/Node.js backend systems.",
        "recent_topics": ["Real-time tracking", "Food delivery logistics", "Microservices", "Redis", "Event-driven architecture"],
        "resources": {
            "youtube": ["Swiggy Engineering talks", "Backend system design"],
            "platforms": ["LeetCode", "GeeksForGeeks", "HackerRank"],
            "articles": ["Swiggy Engineering Blog"],
        }
    },
    "TCS": {
        "tier": "Service", "emoji": "🏢",
        "difficulty": "Easy-Medium", "selection_rate": "25%",
        "avg_rounds": 3, "avg_duration": "1-2 weeks",
        "salary_range": "₹3.5L - ₹10L",
        "culture": "Process-driven, Stability, Learning",
        "focus_areas": ["Aptitude", "Verbal", "Programming Basics", "HR"],
        "interview_rounds": [
            {"round": 1, "name": "TCS NQT / National Qualifier Test", "duration": "180 min", "difficulty": "Easy-Medium", "weightage": "40%", "elimination": "50%", "description": "Verbal, Numerical, Reasoning, Advanced Aptitude, Coding"},
            {"round": 2, "name": "Technical Interview", "duration": "30-45 min", "difficulty": "Easy-Medium", "weightage": "35%", "elimination": "30%", "description": "Core CS subjects, OOP, DBMS, projects, basic coding"},
            {"round": 3, "name": "HR Interview", "duration": "20-30 min", "difficulty": "Easy", "weightage": "25%", "elimination": "15%", "description": "Attitude, communication, relocation, bond acceptance"},
        ],
        "preparation_strategy": "Focus on aptitude and reasoning for NQT. Practice basic C/Java coding. Prepare CS fundamentals (OOPS, DBMS, OS, CN). Strong communication skills essential.",
        "recent_topics": ["OOP concepts", "DBMS normalization", "C programming", "Aptitude problems", "Communication"],
        "resources": {
            "youtube": ["TCS NQT Prep", "PrepInsta TCS"],
            "platforms": ["PrepInsta", "TCS iON", "IndiaBix"],
            "articles": ["TCS Interview Experiences - GFG"],
        }
    },
    "Infosys": {
        "tier": "Service", "emoji": "🌐",
        "difficulty": "Easy-Medium", "selection_rate": "20%",
        "avg_rounds": 3, "avg_duration": "1-2 weeks",
        "salary_range": "₹3.6L - ₹12L",
        "culture": "Client value, Learning, Diversity",
        "focus_areas": ["Aptitude", "Verbal", "Reasoning", "Technical Basics"],
        "interview_rounds": [
            {"round": 1, "name": "Online Test (InfyTQ)", "duration": "95 min", "difficulty": "Easy-Medium", "weightage": "40%", "elimination": "45%", "description": "Aptitude, Logical, Verbal, 2 Programming questions in Python/Java"},
            {"round": 2, "name": "Technical Interview", "duration": "30-45 min", "difficulty": "Easy-Medium", "weightage": "35%", "elimination": "25%", "description": "CS fundamentals, DBMS, OOP, basics coding, project discussion"},
            {"round": 3, "name": "HR Interview", "duration": "15-20 min", "difficulty": "Easy", "weightage": "25%", "elimination": "10%", "description": "Attitude, flexibility, career goals, communication"},
        ],
        "preparation_strategy": "Practice InfyTQ platform. Focus on Python/Java basics. Study DBMS, OS fundamentals. Prepare to discuss final year project in depth.",
        "recent_topics": ["Python basics", "SQL queries", "OOP", "Project discussion", "Communication skills"],
        "resources": {
            "youtube": ["Infosys InfyTQ Prep", "PrepInsta Infosys"],
            "platforms": ["InfyTQ", "PrepInsta", "GeeksForGeeks"],
            "articles": ["Infosys Interview Experiences - GFG"],
        }
    },
    "Wipro": {
        "tier": "Service", "emoji": "💼",
        "difficulty": "Easy", "selection_rate": "30%",
        "avg_rounds": 3, "avg_duration": "1-2 weeks",
        "salary_range": "₹3.5L - ₹8L",
        "culture": "Spirit of Wipro, Integrity, Respectfulness",
        "focus_areas": ["Aptitude", "Verbal", "Basic Coding", "HR"],
        "interview_rounds": [
            {"round": 1, "name": "NLTH (National Level Test for Hiring)", "duration": "150 min", "difficulty": "Easy-Medium", "weightage": "40%", "elimination": "40%", "description": "Online/Offline - Quantitative, Verbal, Logical, Essay, Coding"},
            {"round": 2, "name": "Technical Interview", "duration": "30 min", "difficulty": "Easy-Medium", "weightage": "35%", "elimination": "25%", "description": "Basic CS concepts, one simple coding problem, project"},
            {"round": 3, "name": "HR Interview", "duration": "15 min", "difficulty": "Easy", "weightage": "25%", "elimination": "10%", "description": "Personal questions, relocation, bond, confidence"},
        ],
        "preparation_strategy": "Focus on aptitude math and reasoning. Practice basic coding in C/Java. Prepare CS fundaments briefly. Good communication is key.",
        "recent_topics": ["Loops and arrays", "SQL basics", "OOPS basics", "Resume discussion", "Aptitude shortcuts"],
        "resources": {
            "youtube": ["Wipro NLTH Prep", "PrepInsta Wipro"],
            "platforms": ["PrepInsta", "IndiaBix", "HackerRank"],
            "articles": ["Wipro Interview Experiences - GFG"],
        }
    },
    "Razorpay": {
        "tier": "Indian Product", "emoji": "💳",
        "difficulty": "Hard", "selection_rate": "2%",
        "avg_rounds": 5, "avg_duration": "2-3 weeks",
        "salary_range": "₹20L - ₹70L",
        "culture": "Fintech innovation, Speed, Security, Scale",
        "focus_areas": ["DSA", "System Design", "Payments/Fintech", "Backend"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "90 min", "difficulty": "Medium-Hard", "weightage": "15%", "elimination": "55%", "description": "Algorithmic problems with focus on optimization"},
            {"round": 2, "name": "Technical Round 1", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "40%", "description": "DSA + Backend system concepts, database design"},
            {"round": 3, "name": "Technical Round 2", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "Payment systems design, security, concurrency"},
            {"round": 4, "name": "Engineering Manager", "duration": "45 min", "difficulty": "Medium", "weightage": "20%", "elimination": "25%", "description": "Technical leadership, problem-solving approach, team fit"},
            {"round": 5, "name": "HR Interview", "duration": "30 min", "difficulty": "Easy", "weightage": "15%", "elimination": "15%", "description": "Compensation, culture expectations, joining date"},
        ],
        "preparation_strategy": "Study payment gateway architecture, transaction systems, idempotency. Practice distributed systems design. Learn about UPI, PCI-DSS compliance.",
        "recent_topics": ["Payment systems", "Idempotency", "Database transactions", "Kafka", "Security in fintech"],
        "resources": {
            "youtube": ["Razorpay Engineering talks", "Payment systems design"],
            "platforms": ["LeetCode", "System Design Course"],
            "articles": ["Razorpay Engineering Blog"],
        }
    },
    "Adobe": {
        "tier": "Product", "emoji": "🎨",
        "difficulty": "Hard", "selection_rate": "2%",
        "avg_rounds": 5, "avg_duration": "2-4 weeks",
        "salary_range": "$140k - $300k",
        "culture": "Creativity, Innovation, Diversity, Impact",
        "focus_areas": ["DSA", "System Design", "OOP Design", "Domain Expertise"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "90 min", "difficulty": "Medium", "weightage": "15%", "elimination": "50%", "description": "Coding problems + aptitude"},
            {"round": 2, "name": "Technical Phone Screen", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "20%", "elimination": "40%", "description": "DSA + OOP design, C++ focus"},
            {"round": 3, "name": "Technical Interview 1", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "Advanced DSA, algorithm design, complexity analysis"},
            {"round": 4, "name": "Technical Interview 2", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "30%", "description": "System design, OOP design patterns, architecture"},
            {"round": 5, "name": "Hiring Manager", "duration": "45 min", "difficulty": "Medium", "weightage": "15%", "elimination": "20%", "description": "Culture fit, leadership, problem-solving approach"},
        ],
        "preparation_strategy": "Focus on C++ and OOP design patterns. Practice LeetCode hard problems. Study document processing and media systems for domain-specific interviews.",
        "recent_topics": ["OOP design patterns", "C++ STL", "Graph algorithms", "Document processing", "Cloud architecture"],
        "resources": {
            "youtube": ["Adobe Engineering", "OOP Design Patterns"],
            "platforms": ["LeetCode", "GeeksForGeeks", "Educative.io"],
            "articles": ["Adobe Tech Blog", "Cracking OOP Design"],
        }
    },
    "Uber": {
        "tier": "Product", "emoji": "🚗",
        "difficulty": "Hard", "selection_rate": "1.5%",
        "avg_rounds": 5, "avg_duration": "2-4 weeks",
        "salary_range": "$150k - $380k",
        "culture": "Integrity, Courage, Passion, Customer obsession",
        "focus_areas": ["DSA", "System Design", "Real-time Systems", "Behavioral"],
        "interview_rounds": [
            {"round": 1, "name": "Recruiter Screen", "duration": "30 min", "difficulty": "Easy", "weightage": "5%", "elimination": "30%", "description": "Background, motivation, expectations"},
            {"round": 2, "name": "Technical Phone Screen", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "20%", "elimination": "40%", "description": "2 coding problems, problem-solving approach"},
            {"round": 3, "name": "Technical Onsite 1", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "Advanced DSA, maps/graphs, location-based algorithms"},
            {"round": 4, "name": "System Design", "duration": "60 min", "difficulty": "Hard", "weightage": "25%", "elimination": "35%", "description": "Design Uber's ride-sharing system, surge pricing, real-time tracking"},
            {"round": 5, "name": "Behavioral Round", "duration": "45 min", "difficulty": "Medium", "weightage": "25%", "elimination": "25%", "description": "Leadership stories, conflict resolution, collaboration"},
        ],
        "preparation_strategy": "Study geospatial algorithms, real-time tracking systems. Practice graph problems (shortest path, routing). Design location-based services at global scale.",
        "recent_topics": ["Geospatial algorithms", "Real-time tracking", "Surge pricing", "Microservices", "Driver-rider matching"],
        "resources": {
            "youtube": ["Uber Engineering talks", "Real-time systems design"],
            "platforms": ["LeetCode", "Pramp", "Educative"],
            "articles": ["Uber Engineering Blog"],
        }
    },
    "Zomato": {
        "tier": "Indian Product", "emoji": "🍛",
        "difficulty": "Medium-Hard", "selection_rate": "3%",
        "avg_rounds": 4, "avg_duration": "2 weeks",
        "salary_range": "₹18L - ₹55L",
        "culture": "Feeding India, Speed, Innovation, Fun",
        "focus_areas": ["DSA", "Backend Systems", "System Design", "Behavioral"],
        "interview_rounds": [
            {"round": 1, "name": "Online Assessment", "duration": "60 min", "difficulty": "Medium", "weightage": "15%", "elimination": "50%", "description": "2-3 coding problems with emphasis on efficiency"},
            {"round": 2, "name": "Technical Round", "duration": "60 min", "difficulty": "Medium-Hard", "weightage": "30%", "elimination": "40%", "description": "DSA + backend concepts, API design, database"},
            {"round": 3, "name": "System Design", "duration": "45 min", "difficulty": "Hard", "weightage": "30%", "elimination": "35%", "description": "Design restaurant discovery, ordering, delivery tracking"},
            {"round": 4, "name": "Culture + HR", "duration": "30 min", "difficulty": "Easy", "weightage": "25%", "elimination": "15%", "description": "Team fit, motivation, expectations"},
        ],
        "preparation_strategy": "Study food tech system design. Practice backend API design. Focus on caching, search, and recommendation systems.",
        "recent_topics": ["Food delivery systems", "Search ranking", "Notifications", "Redis caching", "MySQL optimization"],
        "resources": {
            "youtube": ["Zomato Tech talks", "System design food delivery"],
            "platforms": ["LeetCode", "GeeksForGeeks"],
            "articles": ["Zomato Engineering Blog"],
        }
    },
}

# Question bank per category
COMPANY_QUESTION_BANK = {
    "DSA": [
        {"q": "Find the longest common subsequence of two strings.", "difficulty": "Hard", "frequency": "Very High", "time": "30-45 min", "importance": 9},
        {"q": "Implement LRU Cache with O(1) get and put operations.", "difficulty": "Medium", "frequency": "High", "time": "20-30 min", "importance": 9},
        {"q": "Find all possible subsets of a given set.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Detect a cycle in a directed graph using DFS.", "difficulty": "Medium", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Implement a trie data structure with insert, search, and startsWith.", "difficulty": "Medium", "frequency": "High", "time": "25-30 min", "importance": 8},
        {"q": "Find the kth largest element in an unsorted array.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "Serialize and deserialize a binary tree.", "difficulty": "Hard", "frequency": "High", "time": "30-40 min", "importance": 8},
        {"q": "Find the median of two sorted arrays.", "difficulty": "Hard", "frequency": "High", "time": "35-45 min", "importance": 9},
        {"q": "Implement a priority queue using a min-heap.", "difficulty": "Medium", "frequency": "Medium", "time": "20-25 min", "importance": 7},
        {"q": "Find all permutations of a given string.", "difficulty": "Medium", "frequency": "High", "time": "20-25 min", "importance": 7},
    ],
    "System Design": [
        {"q": "Design a URL shortening service like bit.ly.", "difficulty": "Medium", "frequency": "Very High", "time": "45-60 min", "importance": 9},
        {"q": "Design a distributed messaging system like WhatsApp.", "difficulty": "Hard", "frequency": "Very High", "time": "45-60 min", "importance": 9},
        {"q": "Design a ride-sharing system like Uber.", "difficulty": "Hard", "frequency": "High", "time": "45-60 min", "importance": 9},
        {"q": "Design a social media news feed (like Facebook/Twitter).", "difficulty": "Hard", "frequency": "Very High", "time": "45-60 min", "importance": 10},
        {"q": "Design a distributed file storage system like Google Drive.", "difficulty": "Hard", "frequency": "High", "time": "45-60 min", "importance": 8},
        {"q": "Design a recommendation system for an e-commerce platform.", "difficulty": "Hard", "frequency": "High", "time": "45-60 min", "importance": 8},
        {"q": "Design a rate limiter for an API gateway.", "difficulty": "Medium", "frequency": "High", "time": "30-45 min", "importance": 8},
        {"q": "Design a search autocomplete/typeahead system.", "difficulty": "Medium", "frequency": "High", "time": "30-45 min", "importance": 8},
        {"q": "Design a live streaming service like Netflix/YouTube.", "difficulty": "Hard", "frequency": "High", "time": "45-60 min", "importance": 9},
        {"q": "Design a distributed cache system like Redis.", "difficulty": "Hard", "frequency": "Medium", "time": "45-60 min", "importance": 7},
    ],
    "OOPs": [
        {"q": "Design a parking lot system using OOP principles.", "difficulty": "Medium", "frequency": "Very High", "time": "30-45 min", "importance": 9},
        {"q": "Explain the SOLID principles with real-world examples.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 9},
        {"q": "Design a library management system.", "difficulty": "Medium", "frequency": "High", "time": "30-40 min", "importance": 8},
        {"q": "Implement the Observer design pattern.", "difficulty": "Medium", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Difference between composition and inheritance with examples.", "difficulty": "Easy", "frequency": "Very High", "time": "10-15 min", "importance": 8},
        {"q": "Design an elevator system using OOP.", "difficulty": "Hard", "frequency": "Medium", "time": "35-45 min", "importance": 7},
        {"q": "Implement the Strategy design pattern for a payment system.", "difficulty": "Medium", "frequency": "Medium", "time": "20-25 min", "importance": 7},
        {"q": "How would you implement polymorphism in a real project?", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
    ],
    "Java": [
        {"q": "Explain the Java memory model and garbage collection.", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "What are functional interfaces and how do lambdas work in Java 8?", "difficulty": "Medium", "frequency": "High", "time": "10-15 min", "importance": 8},
        {"q": "Explain ConcurrentHashMap vs HashMap thread safety.", "difficulty": "Medium", "frequency": "High", "time": "10-15 min", "importance": 8},
        {"q": "How does the Java Stream API work? Write a pipeline.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "Explain Spring Boot dependency injection with an example.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "What are checked vs unchecked exceptions in Java?", "difficulty": "Easy", "frequency": "High", "time": "10 min", "importance": 7},
        {"q": "How does Java handle multithreading? Explain ExecutorService.", "difficulty": "Hard", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Explain the difference between JDK, JRE, and JVM.", "difficulty": "Easy", "frequency": "Very High", "time": "10 min", "importance": 7},
    ],
    "Python": [
        {"q": "Explain Python's GIL and its implications for multithreading.", "difficulty": "Hard", "frequency": "High", "time": "10-15 min", "importance": 8},
        {"q": "How do decorators work in Python? Write a caching decorator.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "Explain generators and their memory advantages.", "difficulty": "Medium", "frequency": "High", "time": "10-15 min", "importance": 8},
        {"q": "What is the difference between @staticmethod and @classmethod?", "difficulty": "Medium", "frequency": "High", "time": "10 min", "importance": 7},
        {"q": "Explain asyncio and when to use it.", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "How does Python's memory management work (reference counting, GC)?", "difficulty": "Hard", "frequency": "Medium", "time": "10-15 min", "importance": 7},
        {"q": "Write a context manager using __enter__ and __exit__.", "difficulty": "Medium", "frequency": "Medium", "time": "10-15 min", "importance": 7},
        {"q": "Explain list comprehension vs generator expression performance.", "difficulty": "Easy", "frequency": "High", "time": "10 min", "importance": 7},
    ],
    "JavaScript": [
        {"q": "Explain event loop, call stack, and task queue in JavaScript.", "difficulty": "Hard", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "Implement a debounce function from scratch.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "Explain closures with a practical use case.", "difficulty": "Medium", "frequency": "Very High", "time": "10-15 min", "importance": 9},
        {"q": "How does prototype chain work in JavaScript?", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Explain Promise.all, Promise.race, and Promise.allSettled.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Difference between var, let, and const with scope examples.", "difficulty": "Easy", "frequency": "Very High", "time": "10 min", "importance": 8},
        {"q": "Implement a throttle function from scratch.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "How does memoization work? Implement a memoize function.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
    ],
    "React": [
        {"q": "Explain React Virtual DOM and reconciliation algorithm.", "difficulty": "Hard", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "When would you use useCallback vs useMemo?", "difficulty": "Medium", "frequency": "Very High", "time": "10-15 min", "importance": 9},
        {"q": "Explain React fiber architecture and concurrent features.", "difficulty": "Hard", "frequency": "Medium", "time": "20-25 min", "importance": 7},
        {"q": "How would you optimize a slow React component?", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "Explain the difference between Context API and Redux.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "How does useEffect dependency array work? Common pitfalls?", "difficulty": "Medium", "frequency": "Very High", "time": "10-15 min", "importance": 9},
        {"q": "Implement a custom hook for data fetching with loading/error states.", "difficulty": "Medium", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Explain React's controlled vs uncontrolled components.", "difficulty": "Easy", "frequency": "High", "time": "10 min", "importance": 7},
    ],
    "SQL": [
        {"q": "Write a query to find the Nth highest salary in a table.", "difficulty": "Medium", "frequency": "Very High", "time": "10-15 min", "importance": 9},
        {"q": "Explain the difference between INNER, LEFT, RIGHT, and FULL OUTER JOIN.", "difficulty": "Easy", "frequency": "Very High", "time": "10 min", "importance": 9},
        {"q": "What are window functions? Write a query using ROW_NUMBER().", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "How would you optimize a slow SQL query? Explain EXPLAIN plan.", "difficulty": "Hard", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Explain database indexing types (B-tree, Hash) and trade-offs.", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Write a query to find duplicate records in a table.", "difficulty": "Medium", "frequency": "High", "time": "10 min", "importance": 8},
        {"q": "What is the difference between WHERE and HAVING clause?", "difficulty": "Easy", "frequency": "Very High", "time": "5-10 min", "importance": 8},
        {"q": "Explain stored procedures vs functions in SQL.", "difficulty": "Medium", "frequency": "Medium", "time": "10-15 min", "importance": 7},
    ],
    "DBMS": [
        {"q": "Explain ACID properties with real-world examples.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "What are the different normal forms? Explain 3NF vs BCNF.", "difficulty": "Hard", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Explain different database isolation levels and their trade-offs.", "difficulty": "Hard", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "What is database sharding? When would you use it?", "difficulty": "Hard", "frequency": "High", "time": "20-25 min", "importance": 8},
        {"q": "Explain CAP theorem and its implications.", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "What is a deadlock and how do you prevent it?", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Explain NoSQL vs SQL: when to use each?", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
    ],
    "Operating Systems": [
        {"q": "Explain the difference between process and thread.", "difficulty": "Easy", "frequency": "Very High", "time": "10 min", "importance": 9},
        {"q": "What is virtual memory and how does paging work?", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Explain the four conditions for deadlock and prevention methods.", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Explain different CPU scheduling algorithms and their trade-offs.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 7},
        {"q": "What are semaphores and mutexes? How are they different?", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "Explain user mode vs kernel mode transitions.", "difficulty": "Medium", "frequency": "Medium", "time": "10-15 min", "importance": 7},
    ],
    "Computer Networks": [
        {"q": "Explain the OSI model layers with protocols at each layer.", "difficulty": "Medium", "frequency": "Very High", "time": "15-20 min", "importance": 9},
        {"q": "What happens when you type google.com in a browser?", "difficulty": "Hard", "frequency": "Very High", "time": "20-25 min", "importance": 10},
        {"q": "Explain TCP three-way handshake and TLS handshake.", "difficulty": "Medium", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "What is the difference between TCP and UDP? When to use each?", "difficulty": "Easy", "frequency": "Very High", "time": "10 min", "importance": 9},
        {"q": "Explain HTTP/1.1 vs HTTP/2 vs HTTP/3 differences.", "difficulty": "Hard", "frequency": "High", "time": "15-20 min", "importance": 8},
        {"q": "How does DNS resolution work?", "difficulty": "Medium", "frequency": "High", "time": "10-15 min", "importance": 8},
    ],
    "Behavioral": [
        {"q": "Tell me about a time you failed. What did you learn?", "difficulty": "Medium", "frequency": "Very High", "time": "5-10 min", "importance": 10},
        {"q": "Describe a challenging project and how you handled it.", "difficulty": "Medium", "frequency": "Very High", "time": "5-10 min", "importance": 10},
        {"q": "How do you handle disagreements with your team or manager?", "difficulty": "Medium", "frequency": "High", "time": "5-10 min", "importance": 9},
        {"q": "Describe a time you had to make a decision with incomplete information.", "difficulty": "Hard", "frequency": "High", "time": "5-10 min", "importance": 8},
        {"q": "Tell me about a time you had to learn something new quickly.", "difficulty": "Easy", "frequency": "Very High", "time": "5-10 min", "importance": 9},
        {"q": "How do you prioritize tasks when everything seems urgent?", "difficulty": "Medium", "frequency": "High", "time": "5-10 min", "importance": 9},
        {"q": "Describe a time you mentored or helped a junior colleague.", "difficulty": "Easy", "frequency": "High", "time": "5-10 min", "importance": 7},
    ],
    "HR": [
        {"q": "Tell me about yourself.", "difficulty": "Easy", "frequency": "Very High", "time": "2-3 min", "importance": 10},
        {"q": "Why do you want to work at our company?", "difficulty": "Medium", "frequency": "Very High", "time": "3-5 min", "importance": 10},
        {"q": "Where do you see yourself in 5 years?", "difficulty": "Easy", "frequency": "Very High", "time": "3-5 min", "importance": 9},
        {"q": "What are your strengths and weaknesses?", "difficulty": "Medium", "frequency": "Very High", "time": "5 min", "importance": 9},
        {"q": "Why are you leaving your current job?", "difficulty": "Hard", "frequency": "High", "time": "3-5 min", "importance": 8},
        {"q": "What is your expected salary?", "difficulty": "Medium", "frequency": "High", "time": "2-3 min", "importance": 8},
        {"q": "Are you comfortable relocating?", "difficulty": "Easy", "frequency": "High", "time": "1-2 min", "importance": 6},
    ],
}

# ──────────────────────────────────────────────
# Pydantic Models
# ──────────────────────────────────────────────
class CompanyPrepRequest(BaseModel):
    company: str
    categories: Optional[List[str]] = None
    difficulty: Optional[str] = "Medium"
    count: Optional[int] = 20

class EvaluateAnswerRequest(BaseModel):
    company: str
    question: str
    answer: str
    category: str

# ──────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────

@router.get("/companies")
async def get_companies():
    """Get all available companies with metadata."""
    companies = []
    for name, data in COMPANY_DB.items():
        companies.append({
            "name": name,
            "tier": data["tier"],
            "emoji": data["emoji"],
            "difficulty": data["difficulty"],
            "selection_rate": data["selection_rate"],
            "salary_range": data["salary_range"],
            "avg_rounds": data["avg_rounds"],
        })
    return {"companies": companies}


@router.get("/company/{company_name}")
async def get_company_details(company_name: str):
    """Get detailed info about a specific company."""
    data = COMPANY_DB.get(company_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found")
    return {"company": company_name, **data}


@router.post("/generate")
async def generate_company_prep_questions(
    payload: CompanyPrepRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate company-specific interview questions across multiple categories."""
    categories = payload.categories or list(COMPANY_QUESTION_BANK.keys())
    company_data = COMPANY_DB.get(payload.company, {})
    focus_areas = company_data.get("focus_areas", [])
    
    all_questions = []
    questions_per_category = max(2, payload.count // max(len(categories), 1))
    
    for category in categories:
        bank = COMPANY_QUESTION_BANK.get(category, [])
        # Filter by difficulty if specified
        if payload.difficulty and payload.difficulty != "All":
            filtered = [q for q in bank if q["difficulty"] == payload.difficulty]
            if not filtered:
                filtered = bank
        else:
            filtered = bank
        
        # Sort by importance (higher first)
        filtered = sorted(filtered, key=lambda x: x.get("importance", 5), reverse=True)
        
        for i, q in enumerate(filtered[:questions_per_category]):
            all_questions.append({
                "id": f"{category.lower().replace(' ', '_')}_{i}",
                "question": q["q"],
                "category": category,
                "difficulty": q["difficulty"],
                "frequency": q["frequency"],
                "expected_time": q["time"],
                "importance_score": q["importance"],
                "company": payload.company,
                "is_focus_area": category in focus_areas,
                "tip": f"For {payload.company}: Focus on {', '.join(focus_areas[:2]) if focus_areas else 'technical depth and clarity'}.",
                "follow_up": f"What are the trade-offs of your approach? How would you scale this solution at {payload.company}'s scale?",
                "ideal_answer_hint": f"A strong answer demonstrates deep understanding of {category} concepts with real-world examples relevant to {payload.company}'s products and scale."
            })
    
    return {
        "company": payload.company,
        "total_questions": len(all_questions),
        "questions": all_questions,
        "company_info": {
            "difficulty": company_data.get("difficulty", "Unknown"),
            "rounds": company_data.get("interview_rounds", []),
            "preparation_strategy": company_data.get("preparation_strategy", ""),
            "focus_areas": focus_areas
        }
    }


@router.post("/evaluate")
async def evaluate_company_answer(
    payload: EvaluateAnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Evaluate an answer using heuristic scoring."""
    try:
        base_eval = evaluate_answer(payload.question, payload.answer, payload.category)
        base_score = base_eval.get("score", 5)
        
        # Enhance with company-specific evaluation criteria
        company_data = COMPANY_DB.get(payload.company, {})
        focus_areas = company_data.get("focus_areas", [])
        
        # Generate category-specific feedback
        word_count = len(payload.answer.split())
        has_example = any(w in payload.answer.lower() for w in ["example", "e.g.", "such as", "for instance", "in my project", "i implemented"])
        has_structure = any(w in payload.answer.lower() for w in ["first", "second", "then", "finally", "step", "because", "therefore"])
        
        comm_score = min(10, max(3, (word_count / 20) + (2 if has_example else 0) + (1 if has_structure else 0)))
        tech_score = base_score
        confidence_score = min(10, max(3, base_score + (1 if has_example else -1) + (1 if has_structure else 0)))
        problem_solving = min(10, max(3, base_score + (2 if has_example else 0)))
        
        tips = base_eval.get("suggestions", [])
        tips.append(f"For {payload.company} specifically: Tie your answer to their scale and products.")
        if payload.category in focus_areas:
            tips.append(f"{payload.category} is a key focus area at {payload.company} — ensure your answer is thorough.")
        
        return {
            "overall_score": round(base_score, 1),
            "communication_score": round(comm_score, 1),
            "technical_accuracy": round(tech_score, 1),
            "confidence_score": round(confidence_score, 1),
            "problem_solving": round(problem_solving, 1),
            "strengths": base_eval.get("strengths", []),
            "weaknesses": base_eval.get("weaknesses", []),
            "improvement_tips": tips,
            "ideal_answer": base_eval.get("ideal_answer", ""),
            "company_specific_feedback": f"For {payload.company}, emphasis on {', '.join(focus_areas[:3]) if focus_areas else 'technical excellence'} is critical."
        }
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        return {
            "overall_score": 6.0,
            "communication_score": 6.0,
            "technical_accuracy": 6.0,
            "confidence_score": 6.0,
            "problem_solving": 6.0,
            "strengths": ["Attempted the question", "Shows understanding"],
            "weaknesses": ["Could be more detailed", "Need more specific examples"],
            "improvement_tips": ["Add concrete examples", "Structure your answer better", f"Research {payload.company}'s specific requirements"],
            "ideal_answer": "A strong answer should cover the core concepts with practical examples and discuss trade-offs.",
            "company_specific_feedback": f"For {payload.company}, focus on depth and real-world application."
        }


@router.get("/categories")
async def get_categories():
    """Get all question categories."""
    return {"categories": list(COMPANY_QUESTION_BANK.keys())}
