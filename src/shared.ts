export interface Options {
  /**
   * json 文件输出路径
   */
  outDir?: string;

  /**
   * 如果有不同版本的依赖，是否输出详细信息
   */
  logMultiDeps?: boolean;
  /**
   * 是否输出总共参与编译的文件数目
   */
  logFileCount?: boolean;
}
