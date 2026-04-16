import type { ElectronApplication, Locator, Page } from '@playwright/test';

import { mockSaveDialogForFile } from '../../utils';
import { BasePage } from '../base-page';

/**
 * Page Object for the **workspace page** (debug view).
 *
 * Visible at route: `/organization/:orgId/project/:projectId/workspace/:workspaceId`
 *
 * Handles workspace-level operations:
 * - Navigation (breadcrumb navigation)
 * - Export operations (from workspace dropdown)
 */
export class WorkspacePage extends BasePage {
  constructor(
    readonly page: Page,
    readonly app: ElectronApplication,
  ) {
    super(page);
  }

  /** The root workspace container. */
  get root() {
    // Use the breadcrumb as a reliable indicator that workspace is loaded
    return this.page.getByTestId('workspace-page');
  }

  //Louis: Add locator and page behavior for the tests usage.
  get responseStatusTag(): Locator {
    return this.page.locator('[data-testid="response-status-tag"]:visible');
  }

  get responsePane(): Locator {
    return this.page.getByTestId('response-pane');
  }

  get requestPane(): Locator {
    return this.page.getByTestId('request-pane');
  }

  async sendRequest(action: 'Send' | 'Start' | 'Connect' = 'Send'): Promise<void> {
    await this.requestPane.getByRole('button', { name: action }).click();
  }

  async switchResponseToRawData(): Promise<void> {
    await this.page.getByRole('button', { name: 'Preview' }).click();
    await this.page.getByRole('menuitem', { name: 'Raw Data' }).click();
  }

  async openRequestByTestId(requestTestId: string): Promise<void> {
    await this.page.getByTestId(requestTestId).press('Enter');
  }

  async fillRequestUrl(url: string): Promise<void> {
    const urlEditor = this.requestPane.getByTestId('OneLineEditor').first();
    await urlEditor.click();
    //Louis: Seems fill() not working stably, use pressSequentially instead.
    await urlEditor.pressSequentially(url);
  }

  // ===========================================================================
  // Navigation
  // ===========================================================================

  /**
   * Navigates back to the project page using the breadcrumb back button.
   */
  async goBackToProject(): Promise<void> {
    await this.page.getByTestId('project').click();
  }

  // ===========================================================================
  // Export Operations
  // ===========================================================================

  /**
   * Opens the workspace dropdown menu.
   */
  private async openWorkspaceDropdown(): Promise<void> {
    await this.page.getByTestId('workspace-context-dropdown').click();
  }

  /**
   * Exports the workspace from the workspace dropdown.
   * Note: After calling this method, use waitForExportFiles() utility to ensure the file is written.
   * @param exportPath - The absolute path where the file should be exported
   * @param format - The export format ('yaml' or 'har')
   */
  async exportWorkspaceFromDropdown(exportPath: string, format: 'yaml' | 'har' = 'yaml'): Promise<void> {
    // Mock the save dialog first
    await mockSaveDialogForFile(this.app, exportPath);

    // Open workspace dropdown
    await this.openWorkspaceDropdown();

    // Click Export option
    const exportMenuItem = this.page.getByRole('menuitemradio', { name: 'Export' });
    await exportMenuItem.click();

    // Click Export button in the export requests modal (all requests selected by default)
    await this.page.getByRole('dialog').getByRole('button', { name: 'Export' }).click();

    // Select export format
    await this.exportModal.selectExportFormat(format);
  }
}
