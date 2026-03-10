import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'files' })
export class FilesEntity {
  @PrimaryColumn({ name: 'file_grp_id', type: 'varchar', length: 50 })
  fileGrpId!: string;

  @PrimaryColumn({ name: 'file_id', type: 'varchar', length: 50 })
  fileId!: string;

  @Column({ name: 'file_nm', type: 'varchar', length: 255, nullable: true })
  fileNm!: string | null;

  @Column({ name: 'save_file_nm', type: 'varchar', length: 255, nullable: true })
  saveFileNm!: string | null;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  filePath!: string | null;

  // @Column({ name: 'file_exe', type: 'varchar', length: 100, nullable: true })
  // fileExe!: string | null;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;

  @Column({ name: 'file_use_yn', type: 'char', length: 1, default: () => "'Y'", nullable: true })
  fileUseYn!: string | null;

  @Column({ name: 'reg_dt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  regDt!: Date | null;

  @Column({ name: 'reg_id', type: 'varchar', length: 50, nullable: true })
  regId!: string | null;

  @Column({ name: 'mod_dt', type: 'timestamp', nullable: true })
  modDt!: Date | null;

  @Column({ name: 'mod_id', type: 'varchar', length: 50, nullable: true })
  modId!: string | null;
}
