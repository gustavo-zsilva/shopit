import { ItemOp } from './types';

type OpHandler = (listId: string, op: ItemOp) => void;
type DeleteHandler = (listId: string) => void;

let onOp: OpHandler | null = null;
let onDelete: DeleteHandler | null = null;

export function setItemOpHandler(handler: OpHandler | null) {
  onOp = handler;
}

export function setListDeletedHandler(handler: DeleteHandler | null) {
  onDelete = handler;
}

export function emitItemOp(listId: string | undefined, op: ItemOp) {
  if (listId) onOp?.(listId, op);
}

export function emitListDeleted(listId: string) {
  onDelete?.(listId);
}
