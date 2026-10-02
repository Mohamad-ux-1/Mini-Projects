import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "@mui/material/styles";

const MONO = '"JetBrains Mono", monospace';

const CryptoCard = ({
  name,
  symbol,
  rank,
  type,
  price,
  change,
  rangeLow,
  rangeHigh,
  iconSvg,
  iconBg,
  iconColor,
  sparklineData,
}) => {
  const theme = useTheme();

  const isDarkMode = theme.palette.mode === "dark";
  const isPositive = change >= 0;

  //   const chartColor = isPositive ? '#00573A' : '#BA1A1A';
  const chartColor = !isDarkMode
    ? isPositive
      ? "#00573A"
      : "#BA1A1A"
    : isPositive
      ? theme.palette.success.main
      : theme.palette.error.main;
  const badgeBgColor = isPositive ? "#6ffbbe" : "#ffdad6";
  const badgeTextColor = isPositive ? "#003d28" : "#93000a";

  const gradientId = `gradient-${symbol}`;

  const formattedPrice = price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatRange = (num) =>
    `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  // نحسب نطاق المحور Y حتى يظهر الخط بتفاصيله (بدل ما يبدأ من الصفر ويصير مسطّح)
  const values = (sparklineData || []).map((d) => d.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const pad = (max - min) * 0.25 || 1;
  // console.log(symbol, sparklineData?.length);
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
        border: "none",
        // bgcolor: '',
        overflow: "hidden", // عشان المخطط ما يطلع برا الزوايا المدوّرة
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      <CardContent
        sx={{
          p: "0 !important", // الحشوة انتقلت للجزء العلوي فقط، والمخطط ياخد العرض كامل
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          width: "100%",
        }}
      >
        {/* الجزء العلوي (له حشوة) */}
        <Box sx={{ p: "20px 20px 0", width: "100%" }}>
          {/* الرأس */}
          <Box
            
            justifyContent="space-between"
            // alignItems="flex-start"
            mb={2}
            sx={{
              display:"flex",
               justifyContent:"space-between",
            //   gridTemplateColumns: ' repeat(2 , 1fr)',
              width: "100%",
            //   border: "solid red 1px",
              flexDirection: "row",
            }}
          >
            <Box  alignItems="center"sx={{display:"grid",gridTemplateColumns:'repeat(2,auto)', 
}}>
              {/* الأيقونة */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: iconBg,
                  color: iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {iconSvg}
              </Box>

              {/* الاسم والتصنيف */}
              
                <Box sx={{ml:2,display:'grid',gap:0,gridTemplateColumns:'repeat(2,1fr)'}}>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.1 }}
                  >
                    {name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                        ml:-4,
                      color: "text.secondary",
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                      mt: "2px",
                    }}
                  >
                    {symbol}
                  </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    mt: 0.5,
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  Rank #{rank} · {type}
                </Typography>
                </Box>
              
            </Box>

            {/* شارة النسبة */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: badgeBgColor,
                color: badgeTextColor,
                pl: 0.25,
                pr: 1,
                py: 0.25,
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "10px",
                fontFamily: MONO,
                whiteSpace: "nowrap",
                width:'65px',
                height:'16px'
              }}
            >
              {isPositive ? (
                <ArrowDropUpIcon sx={{ fontSize: 16 }} />
              ) : (
                <ArrowDropDownIcon sx={{ fontSize: 16 }} />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </Box>
          </Box>

          {/* السعر والنطاق اليومي */}
          <Box  mb={2} mt={1} >
            <Typography
              variant="h4"
              sx={{
                  mt:'10px',
                fontWeight: 700,
                fontSize: "32px",
                letterSpacing: "-0.02em",
                fontFamily: MONO,
                lineHeight: 1.2,
              }}
            >
              ${formattedPrice}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "12px", mt: 0.5 }}
            >
              24h Range:{" "}
              <span style={{ fontFamily: MONO, fontWeight: 500 }}>
                {formatRange(rangeLow)}
              </span>
              {" - "}
              <span style={{ fontFamily: MONO, fontWeight: 500 }}>
                {formatRange(rangeHigh)}
              </span>
            </Typography>
          </Box>
        </Box>

        {/* المخطط البياني (Sparkline) - ملتصق بالحواف السفلية والجانبية */}
        <Box sx={{ width: "100%", height: 56, mt: "auto", lineHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparklineData}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[min - pad, max + pad]} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;
