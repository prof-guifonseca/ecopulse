'use client';

import { ChevronRight, Coins } from 'lucide-react';
import { SHOP_ITEMS, TOKEN_PACKS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { formatCurrencyCents } from '@/lib/format';
import { cn } from '@/lib/cn';

export function ShopPanel({ tokens }: { tokens: number }) {
  const openModal = useUIStore((s) => s.openModal);
  const owned = useGameStore((s) => s.ownedShopItems);

  return (
    <div className="space-y-5">
      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="t-eyebrow">Carteira</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="t-display leading-[1] text-[var(--accent-green)]">{tokens}</span>
              <span className="t-body-sm">Eco-Tokens</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => openModal({ kind: 'greenMarketInfo' })}>
            Como funciona
          </Button>
        </div>
      </Card>

      <section>
        <h2 className="mb-3 t-title">Packs de apoio</h2>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {TOKEN_PACKS.map((pack) => (
            <li key={pack.id}>
              <button
                onClick={() => openModal({ kind: 'greenMarketInfo', packId: pack.id })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="t-title truncate">{pack.name}</h3>
                    {pack.featured ? (
                      <Chip asStatic active className="text-[var(--accent-gold)]">{pack.badge}</Chip>
                    ) : null}
                  </div>
                  <p className="mt-0.5 t-caption">
                    {pack.tokens} tokens · {formatCurrencyCents(pack.priceInCents)}
                  </p>
                </div>
                <Icon icon={ChevronRight} size={16} className="shrink-0 text-[var(--text-muted)]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 t-title">Itens</h2>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = owned.includes(item.id);
            return (
              <button key={item.id} onClick={() => openModal({ kind: 'shopItem', id: item.id })} className="text-left">
                <Card tone="solid" padded={false} className="flex h-full flex-col gap-2 px-4 py-4">
                  <span className="text-3xl leading-none">{item.emoji}</span>
                  <div className="t-title">{item.name}</div>
                  <p className="t-caption">{item.desc}</p>
                  <div
                    className={cn(
                      'mt-auto inline-flex items-center gap-1 t-body-sm font-semibold',
                      isOwned ? 'text-[var(--accent-green)]' : 'text-[var(--accent-gold)]'
                    )}
                  >
                    {isOwned ? (
                      'Adquirido'
                    ) : (
                      <>
                        <Icon icon={Coins} size={12} />
                        {item.price}
                      </>
                    )}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
