"use client";

// Components
import { Container, Button, Text } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { SelectField } from "../../ui/SelectField";
import { Space } from "../../ui/Space";
import { Icon } from "../../ui/Icon";

// Hooks
import { useState, useEffect, useCallback } from "react";
import { useProjectFormats } from "../../../lib/useProjectFormats";

// Database
import { getProjectAuditEvents } from "../../../database/audit/GetProjectAuditEvents";

// Types
import { AuditEventRecord } from "../../../types/AuditEventTypes";
import { actionData } from "../../../types/ActionResult";

// Utils
import {
  describeAuditEvent,
  describeAuditSubject,
  getValueLabel,
} from "../utils/describeAuditEvent";

// Styles
import contentStyles from "../../../styles/content.module.css";
import styles from "../styles/ProjectAudit.module.css";

const ACTION_FILTERS = [
  { value: "all", label: "Everything" },
  { value: "added", label: "Additions" },
  { value: "changed", label: "Changes" },
  { value: "deleted", label: "Deletions" },
];

const BADGE_CLASS: Record<string, string> = {
  added: styles.badge_added,
  changed: styles.badge_changed,
  deleted: styles.badge_deleted,
};

/**
 * The audit trail for one project.
 *
 * Admin only. The menu item is hidden for everyone else, and the action behind
 * this refuses them as well -- hiding a link restricts nothing, since the endpoint
 * is callable either way.
 *
 * Newest first, one line per write. The trail is scanned for something surprising
 * rather than read through, so an event states who and what in a sentence and puts
 * the figures underneath, where they are only read once the sentence has earned
 * the attention.
 *
 * It does not poll. Everything else in the app refreshes itself because two people
 * share the record; a trail is read deliberately, and a list that reordered itself
 * under the reader would be the one page where live data is a nuisance. The button
 * at the bottom is how it moves.
 */
export const ProjectAudit = ({ params }: { params: { id: string } }) => {
  const { formatDate } = useProjectFormats();
  const [events, setEvents] = useState<AuditEventRecord[]>();
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [action, setAction] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  const { id: projectId } = params;

  const load = useCallback(
    async (nextPage: number, nextAction: string, append: boolean) => {
      setIsLoading(true);

      const result = await getProjectAuditEvents({
        projectId,
        page: nextPage,
        action: nextAction === "all" ? undefined : nextAction,
      });

      const data = actionData(result);

      // A member who reached this by URL rather than by menu. Said plainly rather
      // than shown as an empty trail, which would read as "nothing has happened".
      if (!data) {
        setIsDenied(!result.ok && result.reason === "denied");
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setIsDenied(false);
      setEvents((current) =>
        append && current ? [...current, ...data.events] : data.events,
      );
      setHasMore(data.hasMore);
      setIsLoading(false);
    },
    [projectId],
  );

  useEffect(() => {
    setPage(0);
    load(0, action, false);
  }, [action, load]);

  const onShowMore = () => {
    const nextPage = page + 1;

    setPage(nextPage);
    load(nextPage, action, true);
  };

  /* Time of day to the second, because a run of field saves is seconds apart and
     the order within a minute is the thing being read. The date follows the
     project's own format, like every other date in the product. */
  const formatWhen = (occurredAt: string) => {
    const when = new Date(occurredAt);

    return `${formatDate(occurredAt)} ${when.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })}`;
  };

  return (
    <Container className={contentStyles.content}>
      <ContentHeader
        text="Audit"
        subText="Every addition, change and deletion in this project, newest first."
      />
      <Space />
      <div className={styles.filters}>
        <SelectField
          label="Show"
          items={ACTION_FILTERS}
          value={action}
          onChange={setAction}
        />
      </div>
      <Space />

      {isDenied && (
        <Text as="p">
          {"You need to be an admin of this project to read its audit trail."}
        </Text>
      )}

      {!isDenied && events && events.length === 0 && !isLoading && (
        <div className={styles.events}>
          <p className={styles.empty}>
            {"Nothing recorded yet. Events appear here as the project is worked on."}
          </p>
        </div>
      )}

      {!isDenied && events && events.length > 0 && (
        <>
          <div className={styles.events}>
            {events.map((event) => (
              <div key={event.auditEventId} className={styles.event}>
                <span className={styles.when}>
                  {formatWhen(event.occurredAt)}
                </span>
                <div>
                  <span
                    className={`${styles.badge} ${BADGE_CLASS[event.action] ?? ""}`}
                  >
                    {event.action}
                  </span>{" "}
                  <span className={styles.summary}>
                    {describeAuditEvent(event)}
                  </span>
                  <div className={styles.subject}>
                    {describeAuditSubject(event)}
                  </div>
                </div>
                {/* Only a change has two values to show. An addition or a
                    deletion is the whole record, and the sentence above has
                    already said which. */}
                {event.action === "changed" ? (
                  <div className={styles.change} style={{ gridColumn: 2 }}>
                    <span className={styles.before}>
                      {getValueLabel(event.valueBefore)}
                    </span>
                    <span className={styles.arrow}>{"→"}</span>
                    <span className={styles.after}>
                      {getValueLabel(event.valueAfter)}
                    </span>
                  </div>
                ) : (
                  event.valueAfter && (
                    <div className={styles.change} style={{ gridColumn: 2 }}>
                      <span className={styles.after}>{event.valueAfter}</span>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
          <div className={styles.footer}>
            <span className={styles.count}>
              {`${events.length} ${events.length === 1 ? "event" : "events"}`}
            </span>
            {hasMore && (
              <Button
                variant="outline"
                onClick={onShowMore}
                disabled={isLoading}
              >
                <Icon name="chevron-down" size={17} />
                {isLoading ? "Loading…" : "Show older"}
              </Button>
            )}
          </div>
        </>
      )}
    </Container>
  );
};
