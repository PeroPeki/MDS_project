/** Research & QA's eleven approved sources. Keep canonical links and known publication details. */
export const REFERENCES = Object.freeze([
  {
    id: 'almeida-2023', shortCitation: 'Almeida et al. (2023)',
    authors: 'Almeida, C., Kalinowski, M., Uchôa, A., & Feijó, B.', year: '2023',
    title: 'Negative effects of gamification in education software: Systematic mapping and practitioner perceptions',
    publication: 'Information and Software Technology, 156, 107142',
    url: 'https://doi.org/10.1016/j.infsof.2022.107142',
  },
  {
    id: 'atlassian-burndown', shortCitation: 'Atlassian (n.d.)', authors: 'Atlassian', year: 'n.d.',
    title: 'What is the sprint burndown report?',
    url: 'https://support.atlassian.com/jira-software-cloud/docs/what-is-the-sprint-burndown-report/',
  },
  {
    id: 'deterding-2011', shortCitation: 'Deterding et al. (2011)',
    authors: 'Deterding, S., Dixon, D., Khaled, R., & Nacke, L.', year: '2011',
    title: 'From game design elements to gamefulness: Defining gamification',
    publication: 'Proceedings of the 15th International Academic MindTrek Conference, 9–15',
    url: 'https://doi.org/10.1145/2181037.2181040',
  },
  {
    id: 'grenning-2002', shortCitation: 'Grenning (2002)', authors: 'Grenning, J. W.', year: '2002',
    title: 'Planning poker or how to avoid analysis paralysis while release planning',
    url: 'https://wingman-sw.com/papers/PlanningPoker-v1.1.pdf',
  },
  {
    id: 'hamari-2014', shortCitation: 'Hamari et al. (2014)',
    authors: 'Hamari, J., Koivisto, J., & Sarsa, H.', year: '2014',
    title: 'Does gamification work? A literature review of empirical studies on gamification',
    publication: '2014 47th Hawaii International Conference on System Sciences. IEEE',
    url: 'https://doi.org/10.1109/HICSS.2014.377',
  },
  {
    id: 'hanus-fox-2015', shortCitation: 'Hanus & Fox (2015)', authors: 'Hanus, M. D., & Fox, J.', year: '2015',
    title: 'Assessing the effects of gamification in the classroom: A longitudinal study on intrinsic motivation, social comparison, satisfaction, effort, and academic performance',
    publication: 'Computers & Education, 80, 152–161',
    url: 'https://doi.org/10.1016/j.compedu.2014.08.019',
  },
  {
    id: 'hohmann-speed-boat', shortCitation: 'Hohmann (n.d.)', authors: 'Hohmann, L.', year: 'n.d.',
    title: 'Speed boat', url: 'https://www.lukehohmann.com/innovation-games/speed-boat',
  },
  {
    id: 'hohmann-2006', shortCitation: 'Hohmann (2006)', authors: 'Hohmann, L.', year: '2006',
    title: 'Innovation games: Creating breakthrough products through collaborative play',
    publication: 'Addison-Wesley',
    url: 'https://www.informit.com/store/innovation-games-creating-breakthrough-products-through-9780321437297',
  },
  {
    id: 'schwaber-2004', shortCitation: 'Schwaber (2004)', authors: 'Schwaber, K.', year: '2004',
    title: 'Agile project management with Scrum', publication: 'Microsoft Press',
    url: 'https://www.microsoftpressstore.com/store/agile-project-management-with-scrum-9780735619937',
  },
  {
    id: 'scrum-guide-2020', shortCitation: 'Schwaber & Sutherland (2020)',
    authors: 'Schwaber, K., & Sutherland, J.', year: '2020',
    title: 'The Scrum Guide: The definitive guide to Scrum',
    url: 'https://scrumguides.org/scrum-guide.html',
  },
  {
    id: 'strathern-1997', shortCitation: 'Strathern (1997)', authors: 'Strathern, M.', year: '1997',
    title: 'Improving ratings: Audit in the British university system',
    publication: 'European Review, 5(3), 305–321',
    url: 'https://www.cambridge.org/core/journals/european-review/article/abs/improving-ratings-audit-in-the-british-university-system/FC2EE640C0C44E3DB87C29FB666E9AAB',
  },
].map(Object.freeze));

export const REFERENCES_BY_ID = Object.freeze(Object.fromEntries(REFERENCES.map((reference) => [reference.id, reference])));
