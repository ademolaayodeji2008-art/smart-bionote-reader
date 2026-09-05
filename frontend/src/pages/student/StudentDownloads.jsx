/**
 * StudentDownloads — /student/downloads
 *
 * Manages offline lesson downloads. Only students can download.
 * The backend authorizes each download; nothing is saved without authorization.
 * Blobs are stored in IndexedDB — not in MongoDB, not in localStorage.
 *
 * Smart Bionote Reader is primarily ONLINE. Downloads allow studying downloaded
 * content without an active connection. Subscription-sensitive actions still
 * require periodic online verification.
 */

import { useEffect, useState, useCallback } from "react";
import { Download, Trash2, BookOpen, PenLine, WifiOff, HardDrive } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  getAllDownloadedLessons,
  deleteDownloadedLesson,
  deleteAllDownloads,
  estimateStorageUsage,
} from "../../services/offlineStorageService.js";
import { downloadLesson } from "../../services/downloadService.js";
import { useNavigate } from "react-router-dom";

const TYPE_ICON = { note: BookOpen, drawing: PenLine };

const DownloadItem = ({ record, onDelete, onOpen }) => {
  const lesson = record.lesson;
  const Icon = TYPE_ICON[lesson?.type] ?? BookOpen;
  const downloadedDate = new Date(record.downloadedAt).toLocaleDateString("en-NG");

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-body font-semibold text-text-strong truncate">{lesson?.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant={lesson?.type === "note" ? "primary" : "accent"}>
              {lesson?.type === "note" ? "Note" : "Drawing"}
            </Badge>
            {lesson?.subject && <span className="text-caption">{lesson.subject.name}</span>}
            <span className="text-caption">Downloaded {downloadedDate}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" size="sm" onClick={() => onOpen(lesson)}>
          Open
        </Button>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger"
          onClick={() => onDelete(record.lessonId)} aria-label="Delete download">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

const StudentDownloads = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState(null);
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null); // { lessonId, pct, status }

  const load = useCallback(async () => {
    const [records, storage] = await Promise.allSettled([
      getAllDownloadedLessons(),
      estimateStorageUsage(),
    ]);
    if (records.status === "fulfilled") setDownloads(records.value);
    if (storage.status === "fulfilled") setStorageInfo(storage.value);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (lessonId) => {
    await deleteDownloadedLesson(lessonId);
    toast.success("Download removed.");
    load();
  };

  const handleDeleteAll = async () => {
    await deleteAllDownloads();
    toast.success("All downloads removed.");
    setDeleteAllModal(false);
    load();
  };

  const handleOpen = (lesson) => {
    if (lesson?.type === "note") navigate(`/student/read/${lesson._id}`);
    else navigate(`/student/drawing/${lesson._id}`);
  };

  return (
    <div>
      <PageHeader
        title="My Downloads"
        description="Lessons saved to your device for offline studying."
        action={
          downloads.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setDeleteAllModal(true)}
              className="text-danger hover:text-danger">
              <Trash2 className="h-4 w-4" />Delete All
            </Button>
          )
        }
      />

      {/* Storage info */}
      {storageInfo && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-text-muted">
              <HardDrive className="h-4 w-4" aria-hidden="true" />
              <span className="text-small">
                {storageInfo.usedMB} MB used of ~{storageInfo.quotaMB} MB available
              </span>
            </div>
            <span className="text-small text-text-muted">{downloads.length} lesson{downloads.length !== 1 ? "s" : ""} downloaded</span>
          </div>
          <ProgressBar value={storageInfo.percentage} color="primary" className="mt-3" />
        </Card>
      )}

      {/* Active download progress */}
      {downloadProgress && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <p className="text-small font-semibold text-primary mb-2">{downloadProgress.status}</p>
          <ProgressBar value={downloadProgress.pct} color="primary" showValue />
        </Card>
      )}

      {/* Offline notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
        <p className="text-small text-text-muted">
          Downloaded lessons can be studied without an internet connection. Note lessons use your device's built-in reading voice. Drawing lessons play downloaded teacher audio. Subscription verification still requires internet when renewing.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Spinner size="lg" /></div>
      ) : downloads.length === 0 ? (
        <Card className="py-12 text-center">
          <Download className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-body font-semibold text-text-strong">No downloaded lessons</p>
          <p className="text-small mt-1 text-text-muted">
            Open a lesson and tap "Download" to save it for offline study.
          </p>
          <Button to="/student/lessons" variant="primary" className="mt-4">Browse Lessons</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {downloads.map((record) => (
            <DownloadItem
              key={record.lessonId}
              record={record}
              onDelete={handleDelete}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}

      <Modal open={deleteAllModal} onClose={() => setDeleteAllModal(false)} title="Delete all downloads">
        <p className="text-body text-text-body">
          This will remove all {downloads.length} downloaded lessons from your device. Your cloud data is not affected.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteAllModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteAll}>Delete All</Button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDownloads;
