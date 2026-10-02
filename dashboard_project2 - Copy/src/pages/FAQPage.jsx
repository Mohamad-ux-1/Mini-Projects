
import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Accordion, AccordionSummary, AccordionDetails,
    TextField, InputAdornment, alpha, useTheme, Tabs, Tab, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import IP from './IP.js';

const FAQPage = () => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const faqData = [
        {
            category: "Products Management",
            question: "How do I add a new instrument for sale or rent?",
            answer: "Navigate to the ''  Users And Products  '' tab and click the 'Add Product' button in the top right corner. Fill in the details, upload an image, and save."
        },
        {
            category: "Products Management",
            question: "What are the image requirements for instruments?",
            answer: "We recommend using high-quality JPG or PNG images with a 1:1 ratio (square). The maximum file size is 5MB."
        },
        {
            category: "Account & Settings",
            question: "How can I update my profile details?",
            answer: "Go to the Settings page from the sidebar,  update your information, and click 'Save Changes'."
        },
        {
            category: "Orders",
            question: "How do I track rented instruments?",
            answer: "In your Dashboard, instruments currently rented will have a 'Rented' badge along with the return date specified in the orders table."
        }
    ];

    const categories = ['All', ...new Set(faqData.map(item => item.category))];

    const filteredFAQs = useMemo(() => {
        return faqData.filter(faq => {
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeTab === 'All' || faq.category === activeTab;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeTab, faqData]);

    return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: { xs: 2, md: 4 } }}>

            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mb: 2
                    }}
                >
                    <HelpOutlineRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                    How can we help you?
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                    Search our knowledge base or browse categories below to find answers to common questions.
                </Typography>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for answers (e.g., 'rent', 'profile')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s ease',
                        '&.Mui-focused': {
                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                        }
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchRoundedIcon color="primary" />
                        </InputAdornment>
                    ),
                }}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }
                    }}
                >
                    {categories.map((cat, index) => (
                        <Tab key={index} label={cat} value={cat} />
                    ))}
                </Tabs>
            </Box>

            {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                    <Accordion
                        key={index}
                        elevation={0}
                        sx={{
                            mb: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '12px !important',
                            '&:before': { display: 'none' },
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                            }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon color="primary" />}
                            sx={{
                                py: 0.5,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                            }}
                        >
                            <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                {faq.question}
                            </Typography>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 3, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {faq.answer}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: alpha(theme.palette.divider, 0.04), borderRadius: 3 }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        No results found
                    </Typography>
                    <Typography color="text.secondary" mb={3}>
                        We couldn't find anything matching "{searchQuery}" in {activeTab === 'All' ? 'any category' : activeTab}.
                    </Typography>
                    <Button variant="outlined" sx={{ borderRadius: 2 }} onClick={() => setSearchQuery('')}>
                        Clear Search
                    </Button>
                </Box>
            )}

          
        </Box>
    );
};

export default FAQPage;
