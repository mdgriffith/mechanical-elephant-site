--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}

import           Control.Monad          (forM,forM_)
import           Data.List              (sortBy,isInfixOf)
import           Data.Monoid            ((<>),mconcat, mappend)
import           Data.Ord               (comparing)
import           Hakyll
import           System.Locale          (defaultTimeLocale)
import           System.FilePath.Posix  (takeBaseName,takeDirectory
                                         ,(</>),splitFileName, replaceDirectory )

--------------------------------------------------------------------------------

-- replace a foo/bar.md by foo/bar/index.html
-- this way the url looks like: foo/bar in most browsers
niceRoute :: Routes
niceRoute = customRoute createIndexRoute
  where
    createIndexRoute ident =
        takeDirectory (toFilePath ident) </> takeBaseName (toFilePath ident) </> "index.html"

baseRoute :: Routes
baseRoute = customRoute base
  where
    base ident = replaceDirectory (toFilePath ident) ""

baseRouteHTML :: Routes
baseRouteHTML = customRoute base
  where
    base ident = takeDirectory (replaceDirectory (toFilePath ident) "") </> takeBaseName (toFilePath ident) </> "index.html"



-- replace url of the form foo/bar/index.html by foo/bar
removeIndexHtml :: Item String -> Compiler (Item String)
removeIndexHtml item = return $ fmap (withUrls removeIndexStr) item
  where
    removeIndexStr :: String -> String
    removeIndexStr url = case splitFileName url of
        (dir, "index.html") | isLocal dir -> dir
        _                                 -> url
    isLocal uri = not (isInfixOf "://" uri)


feedConfig :: FeedConfiguration
feedConfig = FeedConfiguration
    { feedTitle       = "Mechanical Elephant: Code, Design, Science"
    , feedDescription = "Haskell, Python, and Design Process"
    , feedAuthorName  = "Matthew Griffith"
    , feedAuthorEmail = "matt@mechanical-elephant.com"
    , feedRoot        = "http://mechanical-elephant.com"
    }

mainDescription :: String
mainDescription = "Programming in haskell, creativity, and the design process."

main :: IO ()
main = hakyll $ do

    match "static/favicon.ico" $ do
        route   baseRoute
        compile copyFileCompiler

    match "static/img/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "pages/about.markdown" $ do
        route   $ baseRouteHTML 
        let aboutCtx =
                constField "title" "About Mechanical Elephant" `mappend`
                constField "nav-selection-about" "true"        `mappend`
                constField "description" mainDescription       `mappend`
                defaultContext
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/base.html" aboutCtx
            >>= relativizeUrls
            >>= removeIndexHtml

    match "pages/styleguide.markdown" $ do
        route   $ baseRouteHTML 
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/base.html" defaultContext
            >>= relativizeUrls
            >>= removeIndexHtml

    match "thoughts/draft/*" $ do
        route $ niceRoute
        let draftCtx =
                constField "draft"   "true"     `mappend`
                defaultContext
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/post.html" draftCtx
            >>= loadAndApplyTemplate "templates/base.html" draftCtx
            >>= relativizeUrls
            >>= removeIndexHtml

    match "thoughts/*" $ do
        route $ niceRoute
        compile $ pandocCompiler
            >>= saveSnapshot "content"
            >>= loadAndApplyTemplate "templates/post.html" postCtx
            >>= saveSnapshot "rendered"
            >>= loadAndApplyTemplate "templates/base.html" postCtx
            >>= relativizeUrls
            >>= removeIndexHtml
            

    create ["atom.xml"] $ do
        route idRoute
        compile $ do
            let feedCtx = postCtx `mappend` bodyField "description"
            posts <- fmap (take 10) . recentFirst =<<
                loadAllSnapshots "thoughts/*" "rendered"
            renderAtom feedConfig feedCtx posts

    create ["rss"] $ do
        route idRoute
        compile $ do
            let feedCtx = postCtx `mappend` bodyField "description"
            posts <- fmap (take 10) . recentFirst =<<
                loadAllSnapshots "thoughts/*" "rendered"
            renderRss feedConfig feedCtx posts



    create ["archive.html"] $ do
        route niceRoute
        compile $ do
            posts <- recentFirst =<< loadAll "thoughts/*"
            let archiveCtx =
                    listField "posts" postCtx (return posts)  `mappend`
                    constField "title" "Archive"              `mappend`
                    constField "nav-selection-archive" "true" `mappend`
                    constField "description" mainDescription  `mappend`
                    defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/archive-post-list.html" archiveCtx
                >>= loadAndApplyTemplate "templates/base.html" archiveCtx
                >>= relativizeUrls
                >>= removeIndexHtml

    create ["index.html"] $ do
        route idRoute
        compile $ do
            posts <-  fmap (take 5) . recentFirst =<<  loadAllSnapshots "thoughts/*" "rendered"
            let indexCtx =
                    listField "posts" teaserCtx (return posts)   `mappend`
                    constField "title" "Mechanical Elephant"   `mappend`
                    constField "nav-selection-thoughts" "true" `mappend`
                    constField "description" mainDescription   `mappend`

                    defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/post-list.html" indexCtx
                >>= loadAndApplyTemplate "templates/base.html" indexCtx
                >>= relativizeUrls
                >>= removeIndexHtml

    match "templates/*" $ compile templateCompiler


--------------------------------------------------------------------------------
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" `mappend`
    defaultContext

teaserCtx :: Context String
teaserCtx = teaserField "teaser" "content" `mappend` postCtx
