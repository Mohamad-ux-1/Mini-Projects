import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, Stack, Switch,
    Table, TableHead, TableBody, TableRow, TableCell, Menu, MenuItem, Checkbox, ListItemText, Typography,
} from '@mui/material';
import { CATALOG, formatCompact } from '../Hooks/useWatchlistData';

const MONO = '"JetBrains Mono", monospace';
const usd = (n) =>
    n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: n < 0.01 ? 6 : n < 1 ? 3 : 2 })}`;
const pct = (n) => (n == null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`);

// ---------------------------------------------------------------- Add asset
export function AddAssetDialog({ open, onClose, onAdd, existingIds, categories }) {
    const [asset, setAsset] = useState(null);
    const [target, setTarget] = useState('');
    const [qty, setQty] = useState('0');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (open) { setAsset(null); setTarget(''); setQty('0'); setCategory(''); }
    }, [open]);

    const options = CATALOG.filter((c) => !existingIds.includes(c.id));
    const valid = asset && Number(target) > 0 && Number(qty) >= 0 && category.trim();

    const submit = () => {
        onAdd({
            id: asset.id, name: asset.name, symbol: asset.symbol, pair: asset.pair,
            category: category.trim(), target: Number(target), qty: Number(qty) || 0,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Add asset to watchlist</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Autocomplete
                        options={options}
                        value={asset}
                        getOptionLabel={(o) => `${o.name} (${o.symbol})`}
                        onChange={(_, v) => { setAsset(v); if (v) setCategory(v.category); }}
                        renderInput={(p) => <TextField {...p} label="Asset" />}
                    />
                    <TextField label="Target price (USDT)" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                    <TextField label="Holdings (quantity)" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
                    <Autocomplete
                        freeSolo
                        options={categories}
                        inputValue={category}
                        onInputChange={(_, v) => setCategory(v)}
                        renderInput={(p) => <TextField {...p} label="Category" />}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" disabled={!valid} onClick={submit}>Add</Button>
            </DialogActions>
        </Dialog>
    );
}

// ---------------------------------------------------------------- Alerts
function TargetField({ value, onCommit }) {
    const [v, setV] = useState(String(value));
    useEffect(() => { setV(String(value)); }, [value]);
    const commit = () => {
        const n = Number(v);
        if (n > 0) onCommit(n); else setV(String(value));
    };
    return (
        <TextField
            size="small" type="number" value={v} sx={{ width: 140 }}
            onChange={(e) => setV(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        />
    );
}

export function AlertsDialog({ open, onClose, rows, onUpdate }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Configure alerts</DialogTitle>
            <DialogContent>
                <Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
                    You get a notification when an asset's price reaches its target.
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Asset</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Target</TableCell>
                            <TableCell align="center">Alert</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{r.symbol}</TableCell>
                                <TableCell align="right" sx={{ fontFamily: MONO }}>{usd(r.price)}</TableCell>
                                <TableCell align="right"><TargetField value={r.target} onCommit={(n) => onUpdate(r.id, { target: n })} /></TableCell>
                                <TableCell align="center">
                                    <Switch size="small" checked={!!r.alertOn} onChange={() => onUpdate(r.id, { alertOn: !r.alertOn })} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions><Button onClick={onClose}>Done</Button></DialogActions>
        </Dialog>
    );
}

// ---------------------------------------------------------------- Compare
export function CompareDialog({ open, onClose, rows }) {
    const metrics = [
        ['Price', (r) => usd(r.price)],
        ['24h change', (r) => pct(r.change)],
        ['24h high', (r) => usd(r.high)],
        ['24h low', (r) => usd(r.low)],
        ['24h volume', (r) => (r.volume == null ? '—' : `$${formatCompact(r.volume)}`)],
        ['Target', (r) => usd(r.target)],
        ['Distance to target', (r) => `${r.distPct.toFixed(1)}%`],
    ];
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Compare assets</DialogTitle>
            <DialogContent>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            {rows.map((r) => <TableCell key={r.id} align="right"><b>{r.symbol}</b></TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {metrics.map(([label, fn]) => (
                            <TableRow key={label}>
                                <TableCell sx={{ color: 'text.secondary' }}>{label}</TableCell>
                                {rows.map((r) => <TableCell key={r.id} align="right" sx={{ fontFamily: MONO }}>{fn(r)}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
        </Dialog>
    );
}

// ---------------------------------------------------------------- Columns
const LABELS = { delta: '24H Delta', target: 'Target Price', dist: 'Distance to Target', vol: '24H Volume', spark: '7D Sparkline' };

export function ColumnsMenu({ anchorEl, onClose, cols, onChange }) {
    return (
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
            {Object.keys(LABELS).map((k) => (
                <MenuItem key={k} dense onClick={() => onChange({ ...cols, [k]: !cols[k] })}>
                    <Checkbox size="small" checked={cols[k]} sx={{ p: 0, mr: 1 }} />
                    <ListItemText primary={LABELS[k]} />
                </MenuItem>
            ))}
        </Menu>
    );
}
