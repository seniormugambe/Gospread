import React, { useEffect, useRef, useState, useId } from 'react';
import * as d3 from 'd3';
import { TrendingUp, Users, Activity, Eye, Zap } from 'lucide-react';
import { VideoStream } from '../data/gospelData';

interface DataPoint {
  time: Date;
  viewers: number;
  label?: string;
}

interface LiveViewerTrendSparklineProps {
  video: VideoStream;
  isLive?: boolean;
}

export default function LiveViewerTrendSparkline({ video, isLive = true }: LiveViewerTrendSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Base initial viewers from video object or fallback
  const baseViewers = video.viewersCount || 12450;

  // Generate initial historical data (last 15 minutes)
  const [data, setData] = useState<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const now = Date.now();
    let current = Math.max(500, baseViewers - 1200);
    
    for (let i = 15; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000);
      // Random walk with upward bias
      const change = (Math.random() - 0.42) * 350;
      current = Math.max(800, Math.round(current + change));
      points.push({ time, viewers: current });
    }
    return points;
  });

  const [hoveredPoint, setHoveredPoint] = useState<{ point: DataPoint; x: number; y: number } | null>(null);
  const [currentViewers, setCurrentViewers] = useState<number>(baseViewers);
  const [peakViewers, setPeakViewers] = useState<number>(baseViewers);
  const [trendPercent, setTrendPercent] = useState<number>(5.4);
  const gradientId = useId();

  // Simulated real-time live ticker update
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Fluctuate relative to current viewers
      const delta = Math.floor((Math.random() - 0.45) * 120);
      const newCount = Math.max(100, currentViewers + delta);
      
      setCurrentViewers(newCount);
      setPeakViewers(prev => Math.max(prev, newCount));

      setData(prevData => {
        const updated = [...prevData.slice(1), { time: now, viewers: newCount }];
        
        // Calculate 15-min growth trend %
        if (updated.length >= 2) {
          const first = updated[0].viewers;
          const last = updated[updated.length - 1].viewers;
          const pct = ((last - first) / (first || 1)) * 100;
          setTrendPercent(Number(pct.toFixed(1)));
        }
        
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, currentViewers]);

  // Render D3 Sparkline Chart
  useEffect(() => {
    if (!svgRef.current || !data.length || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const width = containerRef.current.clientWidth || 320;
    const height = 48; // Compact non-intrusive height
    const margin = { top: 6, right: 10, bottom: 6, left: 10 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // X Scale (Time)
    const timeExtent = d3.extent(data, (d: DataPoint) => d.time) as [Date, Date];
    const xScale = d3.scaleTime()
      .domain(timeExtent[0] && timeExtent[1] ? timeExtent : [new Date(), new Date()])
      .range([0, innerWidth]);

    // Y Scale (Viewer Count)
    const viewerExtent = d3.extent(data, (d: DataPoint) => d.viewers) as [number, number];
    const yMin = Math.max(0, (viewerExtent[0] ?? 0) * 0.9);
    const yMax = (viewerExtent[1] ?? 100) * 1.05;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);

    // D3 Line Generator
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.viewers))
      .curve(d3.curveMonotoneX);

    // D3 Area Generator (for soft gradient under line)
    const areaGenerator = d3.area<DataPoint>()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScale(d.viewers))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients & Glow Filter in SVG Defs
    const defs = svg.append('defs');

    // 1. Area Fill Linear Gradient (Amber-500 to Amber-400 fade)
    const areaGradient = defs.append('linearGradient')
      .attr('id', `sparkline-grad-${gradientId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b') // Amber-500
      .attr('stop-opacity', 0.35);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#fbbf24') // Amber-400
      .attr('stop-opacity', 0.02);

    // 2. Vibrant Amber-400 Line Stroke Linear Gradient
    const strokeGradient = defs.append('linearGradient')
      .attr('id', `line-stroke-grad-${gradientId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    strokeGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b'); // Vibrant Amber-500

    strokeGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#fbbf24'); // Vibrant Amber-400

    strokeGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#fef08a'); // Luminous Yellow-200 / Amber highlight

    // 3. Glow Filter for Live Traffic Pulse Effect
    const glowFilter = defs.append('filter')
      .attr('id', `amber-glow-${gradientId}`)
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Render Area
    g.append('path')
      .datum(data)
      .attr('fill', `url(#sparkline-grad-${gradientId})`)
      .attr('d', areaGenerator);

    // Render Glowing Underlayer Line Path (Animated via D3 Transitions)
    const glowPath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', `url(#line-stroke-grad-${gradientId})`)
      .attr('stroke-width', 4.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', `url(#amber-glow-${gradientId})`)
      .attr('stroke-opacity', 0.5)
      .attr('d', lineGenerator);

    // Render Main Foreground Line Path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', `url(#line-stroke-grad-${gradientId})`)
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', lineGenerator);

    // D3 Continuous Glowing Pulse Transition Loop to represent active live traffic
    function pulseGlowAnimation() {
      glowPath
        .transition()
        .duration(1400)
        .ease(d3.easeSinInOut)
        .attr('stroke-opacity', 0.9)
        .attr('stroke-width', 5.5)
        .transition()
        .duration(1400)
        .ease(d3.easeSinInOut)
        .attr('stroke-opacity', 0.3)
        .attr('stroke-width', 3)
        .on('end', pulseGlowAnimation);
    }
    pulseGlowAnimation();

    // Render Pulse Dot on Last Data Point
    const lastPoint = data[data.length - 1];
    if (lastPoint) {
      const lastX = xScale(lastPoint.time);
      const lastY = yScale(lastPoint.viewers);

      // Glowing aura circle
      g.append('circle')
        .attr('cx', lastX)
        .attr('cy', lastY)
        .attr('r', 6)
        .attr('fill', '#fbbf24')
        .attr('opacity', 0.6)
        .classed('animate-ping', true);

      // Center solid dot
      g.append('circle')
        .attr('cx', lastX)
        .attr('cy', lastY)
        .attr('r', 3.5)
        .attr('fill', '#f59e0b')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);
    }

    // Mouse movement interaction overlay
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      const xDate = xScale.invert(mouseX);
      
      // Find nearest data point
      const bisect = d3.bisector((d: DataPoint) => d.time).center;
      const index = bisect(data, xDate);
      const point = data[index];

      if (point) {
        setHoveredPoint({
          point,
          x: xScale(point.time) + margin.left,
          y: yScale(point.viewers) + margin.top
        });
      }
    });

    overlay.on('mouseleave', () => {
      setHoveredPoint(null);
    });

  }, [data, gradientId]);

  return (
    <div className="w-full rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-slate-800/80 p-2.5 backdrop-blur-md text-slate-100 shadow-sm hover:border-amber-500/40 transition">
      {/* Header Info Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Live Viewer Trend</span>
          </div>

          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {currentViewers.toLocaleString()} watching
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Peak: <strong className="text-slate-200">{peakViewers.toLocaleString()}</strong>
          </span>

          <span className={`flex items-center gap-0.5 font-bold ${trendPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <TrendingUp className={`w-3 h-3 ${trendPercent < 0 ? 'rotate-180' : ''}`} />
            {trendPercent >= 0 ? `+${trendPercent}%` : `${trendPercent}%`} (15m)
          </span>
        </div>
      </div>

      {/* D3 Sparkline SVG Container */}
      <div ref={containerRef} className="relative w-full h-[48px]">
        <svg ref={svgRef} className="w-full h-full overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-12 bg-slate-950/95 text-white px-2 py-1 rounded-lg text-[10px] font-mono border border-amber-500/40 shadow-xl whitespace-nowrap flex flex-col items-center gap-0.5"
            style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y}px` }}
          >
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <Eye className="w-2.5 h-2.5 text-amber-400" />
              {hoveredPoint.point.viewers.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400">
              {hoveredPoint.point.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
