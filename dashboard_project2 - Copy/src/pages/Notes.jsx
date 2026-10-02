import React, {useState, useRef, useEffect} from 'react';
import IP from './IP.js';

import {
    Box,
    Grid,
    Typography,
    Button,
    Card,
    Stack,
    IconButton,
    alpha,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    Skeleton
} from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LabelIcon from '@mui/icons-material/Label';
import useFetch from "../hooks/useFetch.js";

const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const NoteSkeleton = () => {
    const theme = useTheme();
    const skeletonNotes = Array.from({length: 6});
    const skeletonFilters = Array.from({length: 4});
    const skeletonCalendarDays = Array.from({length: 35});

    return (
        <Box sx={{p: {xs: 2, md: 4}, maxWidth: '1400px', mx: 'auto'}}>
            <Box sx={{
                gap: 1, display: 'flex', flexDirection: {xs: 'column', md: 'row', lg: 'row'},
                justifyContent: 'space-between', alignItems: 'flex-end', mb: 5
            }}>
                <Box sx={{width: {xs: '90%', md: '60%'}}}>
                    <Skeleton variant="text" width="60%" height={60} sx={{mb: 1}}/>
                    <Skeleton variant="text" width="80%" height={30}/>
                </Box>
                <Skeleton variant="rectangular" height={48}
                          sx={{flexGrow: {xs: 1, md: 0}, width: {xs: '90%', lg: '300px'}, borderRadius: 1}}/>
            </Box>

            <Box sx={{
                gap: 4,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                flexDirection: 'row',
                flexWrap: 'nowrap'
            }}>
                <Grid item xs={12} lg={3}>
                    <Stack spacing={4} sx={{
                        px: {md: 7, xs: 1},
                        display: 'grid',
                        gridTemplateRows: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 1
                    }}>
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            p: 3,
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <Skeleton variant="text" width="40%" height={24} sx={{mb: 2.5}}/>
                            <Stack spacing={1.5}>
                                {skeletonFilters.map((_, index) => (
                                    <Skeleton key={index} variant="rectangular" height={50} sx={{borderRadius: 3}}/>
                                ))}
                            </Stack>
                        </Box>
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            p: 3,
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                                <Skeleton variant="text" width="50%" height={30}/>
                                <Skeleton variant="rectangular" width={80} height={30} sx={{borderRadius: 2}}/>
                            </Box>
                            <Grid container spacing={2} columns={7} sx={{mb: 2}}>
                                {Array.from({length: 7}).map((_, idx) => (
                                    <Grid item xs={1} key={idx} sx={{textAlign: 'center'}}>
                                        <Skeleton variant="text" width={20} height={20} sx={{mx: 'auto'}}/>
                                    </Grid>
                                ))}
                            </Grid>
                            <Grid container columns={7} rowSpacing={2}>
                                {skeletonCalendarDays.map((_, idx) => (
                                    <Grid item xs={1} key={idx}
                                          sx={{textAlign: 'center', display: 'flex', justifyContent: 'center'}}>
                                        <Skeleton variant="circular" width={28} height={28}/>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Stack>
                </Grid>

                <Grid item xs={12} lg={9} mx={5}>
                    <Grid container spacing={3} sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 2,
                        mt: 1
                    }}>
                        {skeletonNotes.map((_, index) => (
                            <Grid item xs={12} md={6} xl={4} key={index}>
                                <Card elevation={0} sx={{
                                    borderRadius: '7px',
                                    border: `1px solid ${theme.palette.divider}`,
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: 'background.paper'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
                                        <Skeleton variant="rectangular" width={60} height={24}
                                                  sx={{borderRadius: 1.5}}/>
                                        <Skeleton variant="circular" width={28} height={28}/>
                                    </Box>
                                    <Skeleton variant="text" width="80%" height={32} sx={{mb: 1}}/>
                                    <Box sx={{mb: 3, flexGrow: 1}}>
                                        <Skeleton variant="text" width="100%" height={20}/>
                                        <Skeleton variant="text" width="90%" height={20}/>
                                        <Skeleton variant="text" width="70%" height={20}/>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mt: 'auto',
                                        pt: 2,
                                        borderTop: `1px solid ${theme.palette.divider}`
                                    }}>
                                        <Skeleton variant="text" width={100} height={24}/>
                                        <Skeleton variant="circular" width={32} height={32}/>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const Notes = () => {
    const theme = useTheme();
    const apiUrl = IP
    const {data: NOTES_DATA, loading} = useFetch(`${apiUrl}/api/notice/all`, 'GET');
    const [notes, setNotes] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openModal, setOpenModal] = useState(false);
    const [editNoteId, setEditNoteId] = useState(null);
    const contentRef = useRef(null);

    const todayStr = getLocalDate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('personal');
    const [noteDate, setNoteDate] = useState(todayStr);

    useEffect(() => {
        if (NOTES_DATA) {
            if (NOTES_DATA.data && Array.isArray(NOTES_DATA.data)) {
                setNotes(NOTES_DATA.data);
            } else if (Array.isArray(NOTES_DATA)) {
                setNotes(NOTES_DATA);
            }
        }
    }, [NOTES_DATA]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleGoToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };
    const handleDateClick = (day) => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    const calendarDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const prevMonthDays = Array.from({length: firstDayOfMonth}, (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1);

    const monthYearString = currentDate.toLocaleString('en-US', {month: 'long', year: 'numeric'});

    const handleOpenModal = () => setOpenModal(true);

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditNoteId(null);
        setTitle('');
        setContent('');
        setCategory('personal');
        setNoteDate(todayStr);
    };

    async function handleUpdateNote() {
        try {
            const catKey = category.toLowerCase();

            let response = await fetch(`${apiUrl}/api/notice/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    id: editNoteId,
                    title: title.trim(),
                    description: content.trim(),
                    due_date: noteDate,
                    type: catKey
                })
            });

            const result = await response.json();

            if (response.ok) {
                setNotes(notes.map(note => note.id === editNoteId ? {
                    ...note,
                    title: title.trim(),
                    description: content.trim(),
                    due_date: noteDate,
                    type: catKey
                } : note));
                setEditNoteId(null);
                handleCloseModal();
            } else {
                console.error(result);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleEditNote = (note) => {
        setEditNoteId(note.id);
        setTitle(note.title);
        setContent(note.description || note.content);

        const categoryVal = note.type || note.category || 'personal';
        setCategory(categoryVal.toLowerCase());

        const d = new Date(note.due_date || note.date);
        if (!isNaN(d.getTime())) {
            const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setNoteDate(formatted);
        }

        setOpenModal(true);
    };

    async function handleArchiveNote(note) {
        if (!window.confirm("Are you sure you want to archive this note?")) return;

        try {
            let response = await fetch(`${apiUrl}/api/notice/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    id: note.id,
                    title: note.title,
                    description: note.description || note.content,
                    due_date: note.due_date || note.date,
                    type: 'archive'
                })
            });

            if (response.ok) {
                setNotes(notes.map(n => n.id === note.id ? {...n, type: 'archive'} : n));
            } else {
                console.error(await response.json());
            }
        } catch (err) {
            console.error(err);
        }
    }

    const tagColors = {
        project: {color: '#6366F1', bg: '#E0E7FF'},
        personal: {color: '#0EA5E9', bg: '#E0F2FE'},
        urgent: {color: '#EF4444', bg: '#FEE2E2'},
        archive: {color: '#64748B', bg: '#F1F5F9'}
    };

    const filteredNotes = notes.filter(note => {
        const isArchived = note.type?.toLowerCase() === 'archive';

        if (filterType === 'Archived') return isArchived;

        if (isArchived) return false;

        if (filterType === 'All') return true;

        const dateString = note.due_date || note.date;
        const noteDateObj = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        noteDateObj.setHours(0, 0, 0, 0);

        if (filterType === 'Today') {
            return noteDateObj.getTime() === today.getTime();
        }

        if (filterType === 'This Week') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return noteDateObj >= startOfWeek && noteDateObj <= endOfWeek;
        }

        return true;
    });

    async function handleAddNote() {
        try {
            let response = await fetch(`${apiUrl}/api/notice/store`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: content.trim(),
                    due_date: noteDate,
                    type: category,
                })
            });

            const result = await response.json();
            if (response.ok) {
                const newSavedNote = result.data?.id ? result.data : {
                    id: result.id || Date.now(),
                    title: title.trim(),
                    description: content.trim(),
                    due_date: noteDate,
                    type: category.toLowerCase(),
                };

                setNotes(prevNotes => [newSavedNote, ...prevNotes]);
                handleCloseModal();
            } else {
                console.error(result);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleDeleteNote(noteId) {
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            let response = await fetch(`${apiUrl}/api/notice/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({id: noteId})
            });

            if (response.ok) {
                setNotes(notes.filter(note => note.id !== noteId));
            } else {
                console.error(response);
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) return <NoteSkeleton/>;

    else return (
        <Box sx={{p: {xs: 2, md: 4}, maxWidth: '1400px', mx: 'auto'}}>
            <Box sx={{
                gap: 1, display: 'flex', flexDirection: {xs: 'column', md: 'row', lg: 'row'},
                justifyContent: 'space-between', alignItems: 'flex-end', mb: 5
            }}>
                <Box sx={{width: {xs: '90%'}}}>
                    <Typography variant="h4" sx={{color: 'text.primary', mb: 1}}>
                        Notes Management
                    </Typography>
                    <Typography variant="body1" sx={{color: 'text.secondary', fontWeight: 500}}>
                        Organize your thoughts and projects in one place.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleOpenModal}
                    startIcon={<AddCircleOutlineOutlinedIcon/>}
                    sx={{
                        flexGrow: {xs: 1, md: 0}, width: {xs: '90%', lg: '300px'},
                        px: 3, py: 1.5, borderRadius: 1, fontSize: '1rem',
                        display: filteredNotes.length > 0 ? '' : 'none'
                    }}
                >
                    Add New Note
                </Button>
            </Box>

            <Box sx={{
                gap: 4,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                flexDirection: 'row',
                flexWrap: 'nowrap'
            }}>
                <Grid item xs={12} lg={3}>
                    <Stack spacing={4} sx={{px: {md: 7, xs: 1}, display: 'grid', gap: 1}}>
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            p: 3,
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <Typography variant="caption" sx={{
                                fontWeight: 800,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                display: 'block',
                                mb: 2.5
                            }}>
                                Filter By
                            </Typography>

                            <Stack spacing={1}>
                                <Button
                                    fullWidth
                                    onClick={() => setFilterType('All')}
                                    sx={{
                                        justifyContent: 'space-between',
                                        px: 2,
                                        py: 1.5,
                                        bgcolor: filterType === 'All' ? (theme.palette.mode === 'light' ? 'white' : 'background.default') : 'transparent',
                                        borderRadius: 3,
                                        color: filterType === 'All' ? 'primary.main' : 'text.secondary',
                                        '&:hover': {bgcolor: theme.palette.mode === 'light' ? 'white' : 'background.default'},
                                        boxShadow: filterType === 'All' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none'
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        fontWeight: filterType === 'All' ? 800 : 600
                                    }}>
                                        <AllInclusiveIcon fontSize="small"/> Active
                                    </Box>
                                    <Box sx={{
                                        bgcolor: filterType === 'All' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.text.secondary, 0.1),
                                        color: filterType === 'All' ? 'primary.main' : 'text.secondary',
                                        px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 800
                                    }}>
                                        {notes.filter(n => n.type?.toLowerCase() !== 'archive').length}
                                    </Box>
                                </Button>

                                <Button fullWidth onClick={() => setFilterType('Today')} sx={{
                                    justifyContent: 'flex-start',
                                    px: 2,
                                    py: 1.5,
                                    color: filterType === 'Today' ? 'primary.main' : 'text.secondary',
                                    bgcolor: filterType === 'Today' ? (theme.palette.mode === 'light' ? 'white' : 'background.default') : 'transparent',
                                    borderRadius: 3,
                                    boxShadow: filterType === 'Today' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none',
                                    '&:hover': {bgcolor: alpha(theme.palette.text.primary, 0.04)}
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        fontWeight: filterType === 'Today' ? 800 : 600
                                    }}>
                                        <TodayIcon fontSize="small"/> Today
                                    </Box>
                                </Button>

                                <Button fullWidth onClick={() => setFilterType('This Week')} sx={{
                                    justifyContent: 'flex-start',
                                    px: 2,
                                    py: 1.5,
                                    color: filterType === 'This Week' ? 'primary.main' : 'text.secondary',
                                    bgcolor: filterType === 'This Week' ? (theme.palette.mode === 'light' ? 'white' : 'background.default') : 'transparent',
                                    borderRadius: 3,
                                    boxShadow: filterType === 'This Week' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none',
                                    '&:hover': {bgcolor: alpha(theme.palette.text.primary, 0.04)}
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        fontWeight: filterType === 'This Week' ? 800 : 600
                                    }}>
                                        <DateRangeIcon fontSize="small"/> This Week
                                    </Box>
                                </Button>

                                <Button fullWidth onClick={() => setFilterType('Archived')} sx={{
                                    justifyContent: 'space-between',
                                    px: 2,
                                    py: 1.5,
                                    mt: 2,
                                    color: filterType === 'Archived' ? '#64748B' : 'text.secondary',
                                    bgcolor: filterType === 'Archived' ? (theme.palette.mode === 'light' ? 'white' : 'background.default') : 'transparent',
                                    borderRadius: 3,
                                    boxShadow: filterType === 'Archived' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none',
                                    '&:hover': {bgcolor: alpha(theme.palette.text.primary, 0.04)}
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        fontWeight: filterType === 'Archived' ? 800 : 600
                                    }}>
                                        <ArchiveOutlinedIcon fontSize="small"/> Archived
                                    </Box>
                                    <Box sx={{
                                        bgcolor: filterType === 'Archived' ? alpha('#64748B', 0.1) : alpha(theme.palette.text.secondary, 0.1),
                                        color: filterType === 'Archived' ? '#64748B' : 'text.secondary',
                                        px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 800
                                    }}>
                                        {notes.filter(n => n.type?.toLowerCase() === 'archive').length}
                                    </Box>
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            p: 3,
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                                <Typography sx={{fontWeight: 800, fontSize: '1.1rem', color: 'text.primary'}}>
                                    {monthYearString}
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    <IconButton size="small" onClick={handlePrevMonth}><ChevronLeftIcon
                                        fontSize="small"/></IconButton>
                                    <Button size="small" onClick={handleGoToToday} sx={{
                                        minWidth: 'auto', px: 1, py: 0.5, fontSize: '0.75rem', fontWeight: 700,
                                        color: 'text.secondary', bgcolor: alpha(theme.palette.text.primary, 0.04),
                                        borderRadius: 2, '&:hover': {bgcolor: alpha(theme.palette.text.primary, 0.08)}
                                    }}>Today</Button>
                                    <IconButton size="small" onClick={handleNextMonth}><ChevronRightIcon
                                        fontSize="small"/></IconButton>
                                </Box>
                            </Box>

                            <Grid container spacing={2} columns={7} sx={{mb: 2, fontWeight: 'bold'}}>
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                    const isSelectedDayHeader = selectedDate.getDay() === idx &&
                                        selectedDate.getMonth() === currentDate.getMonth() &&
                                        selectedDate.getFullYear() === currentDate.getFullYear();
                                    return (
                                        <Grid item xs={1} key={idx} sx={{textAlign: 'center'}}>
                                            <Typography variant="caption" sx={{
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                                color: isSelectedDayHeader ? 'green' : 'text.secondary'
                                            }}>
                                                {day}
                                            </Typography>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Grid container columns={7} rowSpacing={1}>
                                {prevMonthDays.map((day) => (
                                    <Grid item="true" xs={1} key={`prev-${day}`} sx={{textAlign: 'center'}}>
                                        <Typography variant="body2" sx={{
                                            p: 1,
                                            color: 'text.disabled',
                                            fontSize: '0.8rem'
                                        }}>{day}</Typography>
                                    </Grid>
                                ))}
                                {calendarDays.map((day) => {
                                    const isSelected = selectedDate.getDate() === day &&
                                        selectedDate.getMonth() === currentDate.getMonth() &&
                                        selectedDate.getFullYear() === currentDate.getFullYear();
                                    return (
                                        <Grid item xs={1} key={`day-${day}`} sx={{textAlign: 'center'}}>
                                            <Box
                                                onClick={() => handleDateClick(day)}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    mx: 'auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                                                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                                                    fontWeight: isSelected ? 800 : 500,
                                                    fontSize: '0.85rem',
                                                    '&:hover': {bgcolor: isSelected ? 'primary.dark' : alpha(theme.palette.text.primary, 0.04)}
                                                }}
                                            >
                                                {day}
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    </Stack>
                </Grid>

                <Grid item xs={12} lg={9} mx={5}>
                    <Grid container spacing={3} sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 2,
                        mt: 1
                    }}>

                        {filteredNotes.length > 0 ?
                            filteredNotes.map((note) => (
                                <Grid item xs={12} md={6} xl={4} key={note.id}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: '7px',
                                            border: `1px solid ${theme.palette.divider}`,
                                            p: 3,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            bgcolor: 'background.paper',
                                            '&:hover': {
                                                transform: 'translateY(-6px)',
                                                boxShadow: theme.palette.mode === 'light' ? '0 12px 24px rgba(0,0,0,0.06)' : '0 12px 24px rgba(0,0,0,0.4)',
                                                borderColor: 'transparent',
                                                '& .delete-btn': {opacity: 1, visibility: 'visible'}
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 2
                                        }}>
                                            <Box sx={{
                                                bgcolor: alpha((tagColors[note.type?.toLowerCase()] || tagColors['personal']).color, 0.15),
                                                color: (tagColors[note.type?.toLowerCase()] || tagColors['personal']).color,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1.5,
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                letterSpacing: 0.5
                                            }}>
                                                {note.type}
                                            </Box>
                                            <IconButton
                                                className="delete-btn" size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note.id);
                                                }}
                                                sx={{
                                                    opacity: 0,
                                                    visibility: 'hidden',
                                                    transition: '0.2s',
                                                    color: 'error.light',
                                                    '&:hover': {color: 'error.main', bgcolor: alpha('#EF4444', 0.1)},
                                                    mt: -1,
                                                    mr: -1
                                                }}
                                            >
                                                <HighlightOffOutlinedIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>

                                        <Typography variant="h6" sx={{color: 'text.primary', mb: 1, lineHeight: 1.3}}>
                                            {note.title}
                                        </Typography>
                                        <Typography variant="body2"
                                                    sx={{color: 'text.secondary', mb: 3, flexGrow: 1, lineHeight: 1.6}}>
                                            {note.description}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 'auto',
                                            pt: 2,
                                            borderTop: `1px solid ${theme.palette.divider}`
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                color: 'text.disabled'
                                            }}>
                                                <AccessTimeIcon sx={{fontSize: '1rem'}}/>
                                                <Typography variant="caption"
                                                            sx={{fontWeight: 600}}>{note.due_date}</Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', gap: 1}}>

                                                {note.type?.toLowerCase() !== 'archive' && (
                                                    <IconButton size="small" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchiveNote(note);
                                                    }} sx={{
                                                        color: '#64748B', bgcolor: alpha('#64748B', 0.05),
                                                        '&:hover': {bgcolor: alpha('#64748B', 0.1)}
                                                    }}>
                                                        <ArchiveOutlinedIcon fontSize="small"/>
                                                    </IconButton>
                                                )}

                                                <IconButton  size="small" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditNote(note);
                                                }} sx={{
                                                    display: note.type?.toLowerCase() === 'archive' ? 'none' : 'inline-flex',
                                                    color: 'primary.main',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    '&:hover': {bgcolor: alpha(theme.palette.primary.main, 0.1)}
                                                }}>
                                                    <EditNoteIcon fontSize="small"/>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            )) : (
                                <Box sx={{ textAlign: 'center', py: 10}}>
                                    <EditNoteIcon sx={{fontSize: 60, color: 'text.disabled', mb: 2}}/>
                                    <Typography variant="h6" color="text.secondary">
                                        No notes found
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled" mb={3}>
                                        Try changing your filters or add a new note.
                                    </Typography>
                                    {filterType !== 'Archived' && (
                                        <Button variant="outlined" onClick={handleOpenModal}
                                                startIcon={<AddCircleOutlineOutlinedIcon/>}>
                                            Create Note
                                        </Button>
                                    )}
                                </Box>
                            )}
                    </Grid>
                </Grid>
            </Box>

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth
                    PaperProps={{sx: {borderRadius: 4, p: 1, bgcolor: 'background.paper', backgroundImage: 'none'}}}>
                <DialogTitle sx={{pb: 1, pt: 3, px: 4}}>
                    <Typography variant="h4" sx={{fontWeight: 800}}>
                        {editNoteId ? 'Edit Note' : 'Add New Note'}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.secondary', mt: 1}}>
                        Capture your thoughts in the editorial workspace.
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{px: 4, py: 2}}>
                    <Stack spacing={3} sx={{mt: 1}}>
                        <Box>
                            <Typography variant="caption" sx={{
                                fontWeight: 800,
                                color: 'text.disabled',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                display: 'block',
                                mb: 1
                            }}>
                                Note Title
                            </Typography>
                            <TextField fullWidth variant="outlined" placeholder="Enter a descriptive title..."
                                       value={title} onChange={(e) => setTitle(e.target.value)} sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    bgcolor: 'background.default'
                                }
                            }}/>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{
                                fontWeight: 800,
                                color: 'text.disabled',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                display: 'block',
                                mb: 1
                            }}>
                                Content
                            </Typography>
                            <Box sx={{
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                overflow: 'hidden'
                            }}>
                                <TextField fullWidth multiline rows={5} placeholder="Start typing your note here..."
                                           variant="standard" value={content}
                                           onChange={(e) => setContent(e.target.value)} inputRef={contentRef} sx={{
                                    bgcolor: 'background.default',
                                    p: 2,
                                    '& .MuiInputBase-root': {
                                        '&::before': {display: 'none'},
                                        '&::after': {display: 'none'}
                                    }
                                }}/>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{
                                    fontWeight: 800,
                                    color: 'text.disabled',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    display: 'block',
                                    mb: 1
                                }}>
                                    Date
                                </Typography>
                                <TextField
                                    fullWidth variant="outlined" type="date" value={noteDate}
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        if (selected && selected < todayStr) setNoteDate(todayStr);
                                        else setNoteDate(selected);
                                    }}
                                    InputProps={{
                                        startAdornment: <CalendarMonthIcon
                                            sx={{color: 'text.secondary', mr: 1, fontSize: '1.2rem'}}/>
                                    }}
                                    inputProps={{min: todayStr}}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : 'background.default'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{
                                    fontWeight: 800,
                                    color: 'text.disabled',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    display: 'block',
                                    mb: 1
                                }}>
                                    Category
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        variant='outlined'
                                        required={true}
                                                                value={category === 'archive' ? 'personal' : category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        startAdornment={<LabelIcon
                                            sx={{color: 'text.secondary', ml: 1, mr: 0.5, fontSize: '1.2rem'}}/>}
                                        sx={{
                                            borderRadius: 2,
                                            bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : 'background.default'
                                        }}
                                    >
                                        <MenuItem value="project">Project</MenuItem>
                                        <MenuItem value="personal">Personal</MenuItem>
                                        <MenuItem value="urgent">Urgent</MenuItem>

                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{px: 4, py: 3, pt: 1, mt: 3, borderRadius: '0 0 16px 16px'}}>
                    <Button onClick={handleCloseModal} sx={{color: 'text.secondary', fontWeight: 700, px: 3}}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={editNoteId ? handleUpdateNote : handleAddNote}
                        disabled={!title.trim() || !content.trim()}
                        sx={{px: 4, py: 1, borderRadius: 1, fontWeight: 700}}
                    >
                        {editNoteId ? 'Update Note' : 'Save Note'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Notes;
