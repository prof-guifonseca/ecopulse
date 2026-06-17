import type { EcoPulseEvent } from '@/domain';
import type { AppError } from '@/lib/ports/appError';
import type { EventStore } from '@/lib/ports/eventStore';
import { ok, type Result } from '@/lib/ports/result';

/**
 * A Command is the single shape for an imperative state mutation (P1). It
 * receives its dependencies (store actions + pure helpers, injected — never
 * imported, enforced by ESLint) and returns either its output + the domain
 * event to record, or a typed AppError.
 *
 * CONVENTION: a command must validate fully BEFORE mutating, and return `err`
 * before any state change — so a failed command needs no rollback.
 */
export type Command<Deps, Input, Output> = (
  deps: Deps,
  input: Input,
) => Result<{ output: Output; event: EcoPulseEvent }, AppError>;

export interface CommandContext {
  eventStore: EventStore;
  /** Observe a durability gap without throwing — local-first keeps the
   *  optimistic store state; the future outbox/sync will re-deliver. */
  onAppendFailure?: (error: AppError, event: EcoPulseEvent) => void;
  /** Cross-cutting observation of a successful command — anonymous usage
   *  telemetry (P7) attaches here, exactly once. Dormant until live flows are
   *  routed through this seam (PR-5); the composition root wires it. */
  onCommandExecuted?: (event: EcoPulseEvent) => void;
}

/**
 * executeCommand — the one seam every mutation flows through. Runs the command,
 * appends its event through the EventStore Port, and surfaces (not swallows) a
 * durability failure. This is where cross-cutting concerns (telemetry, future
 * retry) attach exactly once.
 */
export async function executeCommand<Deps, Input, Output>(
  command: Command<Deps, Input, Output>,
  deps: Deps,
  input: Input,
  ctx: CommandContext,
): Promise<Result<Output, AppError>> {
  const result = command(deps, input);
  if (!result.ok) return result;

  const { output, event } = result.value;
  const appended = await ctx.eventStore.append(event);
  if (appended.ok) {
    ctx.onCommandExecuted?.(event);
  } else {
    ctx.onAppendFailure?.(appended.error, event);
  }

  return ok(output);
}
