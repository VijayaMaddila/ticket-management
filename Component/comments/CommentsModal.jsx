import React, { useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import CommentItem from "./CommentItem";
import "./comments.css";

/**
 * Modal that shows a list of comments. Optional footer (e.g. textarea + send) for adding comments.
 */
const CommentsModal = ({
  isOpen,
  onClose,
  comments = [],
  currentUserId,
  title = "Comments",
  footer,
  scrollRef,
}) => {
  const defaultRef = useRef(null);
  const listRef = scrollRef ?? defaultRef;

  useEffect(() => {
    if (!isOpen || !listRef?.current) return;
    const el = listRef.current;
    const t = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
    return () => clearTimeout(t);
  }, [isOpen, comments, listRef]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="comments-modal-box">
      <div className="comments-content-inner">
        {comments.length === 0 ? (
          <p>No comments for this ticket.</p>
        ) : (
          <ul className="comments-ul" ref={listRef}>
            {comments.map((c) => (
              <li key={c.id} className="comment-li">
                <CommentItem
                  comment={c}
                  isOutgoing={c.user?.id === currentUserId}
                />
              </li>
            ))}
          </ul>
        )}
        {footer}
      </div>
    </Modal>
  );
};

export default CommentsModal;
