import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

export default function GalleryPanel() {
  const [files, setFiles] = useState([]);

  function onSelect(e) {
    const list = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...list]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function removeAt(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <Card
      title="Galeri"
      subtitle="Impor file gambar secara manual dari perangkat Anda (tidak membaca seluruh penyimpanan)."
    >
      <label
        htmlFor="gallery-input"
        className="btn ghost sm"
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        Pilih gambar
      </label>
      <input
        id="gallery-input"
        type="file"
        accept="image/*"
        multiple
        onChange={onSelect}
        style={{ display: 'none' }}
      />
      {files.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
          Belum ada file dipilih.
        </p>
      ) : (
        <div className="file-list">
          {files.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="file-item">
              <span className="file-item-name" title={file.name}>{file.name}</span>
              <Button size="sm" variant="ghost" onClick={() => removeAt(idx)}>
                Hapus
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
