describe('smoke test', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:3000/api/oauth/token', {
      fixture: 'session.json',
    });
    cy.intercept(
      'GET',
      'http://localhost:3000/api/bookmarks?filter[read]=false&',
      {fixture: 'bookmarks.json'},
    );
    cy.intercept('POST', 'http://localhost:3000/api/bookmarks?').as(
      'addBookmark',
    );
    cy.intercept('PATCH', 'http://localhost:3000/api/bookmarks/1?').as(
      'markBookmarkRead',
    );
  });

  it('allows listing, adding, and marking bookmarks as read', () => {
    cy.visit('/');

    // sign in
    cy.getTestId('email-field-flat').type('example@example.com');
    cy.getTestId('password-field-flat').type('password');
    cy.getTestId('sign-in-button').click();

    // add bookmark
    cy.getTestId('url-to-add-field-flat').type(
      'https://codingitwrong.com{enter}',
    );
    cy.wait('@addBookmark');

    // mark bookmark read
    cy.getTestId('bookmarks-list').contains('React Native');
    cy.getTestId('mark-read-button').click();
    cy.wait('@markBookmarkRead');
  });
});
