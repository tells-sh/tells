<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<footer>
  <div class="inner mono">
    <div class="left">
      <span>Copyright (C) 2026 Tells Contributors</span>
      <span>AGPL-3.0-or-later</span>
    </div>
    <div class="right">
      <a href="#/pricing">pricing</a>
      <a href="#/privacy">privacy</a>
      <a href="https://github.com/tells-sh/tells">source code</a>
      <span>contact@tells.sh</span>
    </div>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--line);
  }

  .inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 36px 32px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 16px;
    font-size: 13px;
    color: var(--muted);
  }

  .left {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .right {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }

  .right a {
    color: var(--muted);
    text-decoration: none;
  }
</style>
