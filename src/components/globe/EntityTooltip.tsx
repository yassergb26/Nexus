import { useMapStore } from '../../store/useMapStore'

export default function EntityTooltip() {
  const hoveredEntity = useMapStore((s) => s.hoveredEntity)

  if (!hoveredEntity) return null

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: hoveredEntity.screenX + 14,
        top: hoveredEntity.screenY - 10,
      }}
    >
      <div className="bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#333] rounded px-2.5 py-1.5 max-w-[200px]">
        <div className="text-[10px] font-mono text-[#e0e0e0] tracking-wider truncate">
          {hoveredEntity.name}
        </div>
        <div className="text-[8px] font-mono text-[#555] tracking-wider mt-0.5 uppercase">
          {hoveredEntity.id.startsWith('base-') ? 'Military Base' : hoveredEntity.id.split('-')[0]}
        </div>
      </div>
    </div>
  )
}
