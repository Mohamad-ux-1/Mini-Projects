// src/components/Sidebar.jsx
import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const drawerWidth = 260;
const NAVY = "#0b3f9e";
const MONO = '"JetBrains Mono", monospace';

// عناصر القوائم
const mainItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <GridViewOutlinedIcon fontSize="small" />,
  },
  {
    id: "watchlist",
    label: "Watchlist",
    icon: <StarBorderIcon fontSize="small" />,
  },
//   {
//     id: "portfolio",
//     label: "Portfolio",
//     icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
//   },
];

const prefItems = [
  {
    id: "alerts",
    label: "Alerts",
    icon: <NotificationsNoneIcon fontSize="small" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsOutlinedIcon fontSize="small" />,
  },
];

// عنوان القسم (CORE TERMINAL / PREFERENCES)
const SectionLabel = ({ children }) => (
  <Typography
    sx={{
      px: 3,
      mb: 1,
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "text.secondary",
    }}
  >
    {children}
  </Typography>
);

// عنصر تنقّل واحد
const NavItem = ({ item, selected, onClick }) => (
  <ListItemButton
    selected={selected}
    onClick={onClick}
    sx={{
      mx: 1.5,
      mb: 0.5,
      px: 1.5,
      height: 44,
      borderRadius: "10px",
      color: "text.secondary",
      "&:hover": { bgcolor: "action.hover" },
      "&.Mui-selected": { bgcolor: NAVY, color: "#ffffff" },
      "&.Mui-selected:hover": { bgcolor: NAVY },
    }}
  >
    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
      {item.icon}
    </ListItemIcon>
    <ListItemText
      disableTypography
      primary={
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: selected ? 600 : 500,
            color: "inherit",
          }}
        >
          {item.label}
        </Typography>
      }
    />
  </ListItemButton>
);

// محتوى الشريط الجانبي (يُستخدم بالنسختين: الثابتة والمنزلقة)
const SidebarContent = ({ active, onSelect, latency }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", py: 2.5 }}
    >
      {/* الشعار */}
      <Box
        sx={{ px: 2.5, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: NAVY,
            color: "#ffffff",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShowChartIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "text.primary",
            }}
          >
            Apex
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            Crypto Tracker
          </Typography>
        </Box>
      </Box>

      {/* القائمة الرئيسية */}
      <SectionLabel>Core Terminal</SectionLabel>
      <List disablePadding>
        {mainItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            selected={active === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
        <NavItem
          key={1000}
          item={{
            id: "portfolio",
            label: "Portfolio",
            icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
          }}
          sx={{ bgcolor: "gray" }}
        />
        {/* <Box~ */}
      </List>

      {/* مسافة مرنة تدفع باقي العناصر للأسفل */}
      <Box sx={{ flexGrow: 1 }} />

      {/* التفضيلات */}
      <SectionLabel>Preferences</SectionLabel>
      <List disablePadding>
        {prefItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            selected={active === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </List>

      {/* حالة الشبكة */}
      <Box
        sx={{
          mx: 2,
          mt: 2,
          px: 1.5,
          py: 1.25,
          borderRadius: "10px",
          bgcolor: isLight ? "#eaf1ff" : "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: isLight ? "#00573a" : "#6ffbbe",
            }}
          />
          <Typography
            sx={{ fontSize: "12px", fontWeight: 500, color: "text.primary" }}
          >
            Live Network
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: "11px",
            fontWeight: 600,
            color: "#00a86b",
          }}
        >
          {latency}
        </Typography>
      </Box>
    </Box>
  );
};

import { useNavigate, useLocation } from "react-router-dom";

// ... (باقي الكود في الأعلى)

const Sidebar = ({ mobileOpen = false, onClose, latency = "9ms" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // استخراج اسم الصفحة الحالية من الرابط لتحديد العنصر النشط
  const active = location.pathname.replace("/", "") || "dashboard";

  const handleSelect = (id) => {
    navigate(`/${id}`); // التوجيه إلى الرابط الجديد
    onClose?.();
  };
  // ...

  const paperSx = {
    width: drawerWidth,
    boxSizing: "border-box",
    bgcolor: "background.paper",
    backgroundImage: "none",
  };

  const content = (
    <SidebarContent active={active} onSelect={handleSelect} latency={latency} />
  );

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* موبايل وتابلت: قائمة منزلقة تنفتح من زر الهامبرغر */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} // أفضل أداء على الموبايل
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        {content}
      </Drawer>

      {/* الشاشات الكبيرة: شريط ثابت */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            ...paperSx,
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
